import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Shield, Users, MapPin, Mail, Bird, FileText, Calendar, X,
    Loader, TrendingUp, Eye, Trash2, BarChart3, Settings, Plus,
    Search, RefreshCw, AlertTriangle, TreePine, Mountain, CheckCircle2,
    ArrowUpRight, Bell, Clock, UserCog, CheckCheck
} from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';
const CONFIRM_NULL = { show: false, message: '', onConfirm: null };

function AdminDashboard() {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [trips, setTrips] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [wildlife, setWildlife] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [sanctuaries, setSanctuaries] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [confirm, setConfirm] = useState(CONFIRM_NULL);
    const [addModal, setAddModal] = useState({ show: false, type: '' });
    const [addForm, setAddForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                axios.get(`${API}/trips`, { headers }),
                axios.get(`${API}/newsletter`, { headers }),
                axios.get(`${API}/contact`, { headers }),
                axios.get(`${API}/wildlife`, { headers }),
                axios.get(`${API}/destinations`),
                axios.get(`${API}/sanctuaries`),
                axios.get(`${API}/alerts`),
                axios.get(`${API}/users`, { headers }),
            ]);
            const [tripsR, nlR, contactR, wildlifeR, destR, sanctR, alertR, usersR] = results;
            if (tripsR.status === 'fulfilled') setTrips(tripsR.value.data);
            if (nlR.status === 'fulfilled') setNewsletters(nlR.value.data);
            if (contactR.status === 'fulfilled') setContacts(contactR.value.data);
            if (wildlifeR.status === 'fulfilled') setWildlife(wildlifeR.value.data);
            if (destR.status === 'fulfilled') setDestinations(destR.value.data);
            if (sanctR.status === 'fulfilled') setSanctuaries(sanctR.value.data);
            if (alertR.status === 'fulfilled') setAlerts(alertR.value.data);
            if (usersR.status === 'fulfilled') setUsers(usersR.value.data);
        } catch (err) { console.log(err.message); }
        finally { setLoading(false); }
    };

    const promptDelete = (message, onConfirm) => setConfirm({ show: true, message, onConfirm });

    /* ── DELETE handlers ─────────────────────────── */
    const deleteTrip = (id) => promptDelete('Delete this trip permanently?', async () => {
        await axios.delete(`${API}/trips/${id}`, { headers });
        setTrips(p => p.filter(t => t._id !== id));
        showToast('Trip deleted.');
    });
    const deleteContact = (id) => promptDelete('Delete this contact message?', async () => {
        await axios.delete(`${API}/contact/${id}`, { headers });
        setContacts(p => p.filter(c => c._id !== id));
        showToast('Message deleted.');
    });
    const deleteNewsletter = (id) => promptDelete('Remove this subscriber?', async () => {
        await axios.delete(`${API}/newsletter/${id}`, { headers });
        setNewsletters(p => p.filter(n => n._id !== id));
        showToast('Subscriber removed.');
    });
    const deleteSighting = (id) => promptDelete('Delete this wildlife sighting?', async () => {
        await axios.delete(`${API}/wildlife/${id}`, { headers });
        setWildlife(p => p.filter(w => w._id !== id));
        showToast('Sighting deleted.');
    });
    const deleteDestination = (id) => promptDelete('Delete this destination?', async () => {
        await axios.delete(`${API}/destinations/${id}`, { headers });
        setDestinations(p => p.filter(d => d._id !== id));
        showToast('Destination deleted.');
    });
    const deleteSanctuary = (id) => promptDelete('Delete this sanctuary?', async () => {
        await axios.delete(`${API}/sanctuaries/${id}`, { headers });
        setSanctuaries(p => p.filter(s => s._id !== id));
        showToast('Sanctuary deleted.');
    });
    const deleteAlert = (id) => promptDelete('Delete this nature alert?', async () => {
        await axios.delete(`${API}/alerts/${id}`, { headers });
        setAlerts(p => p.filter(a => a._id !== id));
        showToast('Alert deleted.');
    });
    const deleteUser = (id, name) => promptDelete(`Delete user "${name}"? This cannot be undone.`, async () => {
        await axios.delete(`${API}/users/${id}`, { headers });
        setUsers(p => p.filter(u => u._id !== id));
        showToast('User deleted.');
    });

    /* ── UPDATE handlers ─────────────────────────── */
    const updateTripStatus = async (id, status) => {
        try {
            await axios.put(`${API}/trips/${id}`, { status }, { headers });
            setTrips(p => p.map(t => t._id === id ? { ...t, status } : t));
            showToast(`Status updated to "${status}".`);
        } catch { showToast('Failed to update status.', 'error'); }
    };

    const markContactRead = async (id) => {
        try {
            await axios.put(`${API}/contact/${id}/read`, {}, { headers });
            setContacts(p => p.map(c => c._id === id ? { ...c, status: 'read' } : c));
            showToast('Marked as read.');
        } catch { showToast('Failed.', 'error'); }
    };

    const updateUserRole = async (id, role) => {
        try {
            await axios.put(`${API}/users/${id}/role`, { role }, { headers });
            setUsers(p => p.map(u => u._id === id ? { ...u, role } : u));
            showToast(`Role updated to "${role}".`);
        } catch { showToast('Failed to update role.', 'error'); }
    };

    /* ── ADD modal ───────────────────────────────── */
    const openAdd = (type) => { setAddForm({}); setAddModal({ show: true, type }); };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { type } = addModal;
            const urlMap = { destination: 'destinations', sanctuary: 'sanctuaries', alert: 'alerts', wildlife: 'wildlife' };
            const setterMap = { destination: setDestinations, sanctuary: setSanctuaries, alert: setAlerts, wildlife: setWildlife };
            const res = await axios.post(`${API}/${urlMap[type]}`, addForm, { headers });
            setterMap[type](p => [res.data, ...p]);
            setAddModal({ show: false, type: '' });
            showToast('Added successfully!');
        } catch { showToast('Failed to add. Try again.', 'error'); }
        finally { setSaving(false); }
    };

    /* ── Filter ──────────────────────────────────── */
    const filtered = (data, keys) => {
        if (!search) return data;
        const q = search.toLowerCase();
        return data.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(q)));
    };

    /* ── Tabs & Stats ────────────────────────────── */
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
        { id: 'trips', label: 'Trips', icon: <MapPin size={18} />, count: trips.length },
        { id: 'destinations', label: 'Destinations', icon: <Mountain size={18} />, count: destinations.length },
        { id: 'sanctuaries', label: 'Sanctuaries', icon: <TreePine size={18} />, count: sanctuaries.length },
        { id: 'wildlife', label: 'Wildlife', icon: <Bird size={18} />, count: wildlife.length },
        { id: 'alerts', label: 'Alerts', icon: <Bell size={18} />, count: alerts.length },
        { id: 'contacts', label: 'Messages', icon: <Mail size={18} />, count: contacts.length },
        { id: 'newsletter', label: 'Subscribers', icon: <Users size={18} />, count: newsletters.length },
        { id: 'users', label: 'Users', icon: <UserCog size={18} />, count: users.length },
    ];

    const statCards = [
        { label: 'Total Trips', value: trips.length, icon: <MapPin size={22} />, color: '#0de381', bg: 'rgba(13,227,129,0.1)', change: `${trips.filter(t => !t.status || t.status === 'planned').length} planned` },
        { label: 'Destinations', value: destinations.length, icon: <Mountain size={22} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', change: 'Active' },
        { label: 'Subscribers', value: newsletters.length, icon: <Mail size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', change: 'Newsletter' },
        { label: 'Messages', value: contacts.length, icon: <FileText size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', change: `${contacts.filter(c => c.status === 'unread' || !c.status).length} unread` },
        { label: 'Wildlife', value: wildlife.length, icon: <Bird size={22} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', change: 'Sightings' },
        { label: 'Sanctuaries', value: sanctuaries.length, icon: <TreePine size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', change: 'Hidden' },
        { label: 'Alerts Active', value: alerts.filter(a => a.level === 'high').length, icon: <Bell size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', change: 'High Priority' },
        { label: 'Registered Users', value: users.length, icon: <Users size={22} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', change: `${users.filter(u => u.role === 'admin').length} admins` },
    ];

    const AddModalConfig = {
        destination: {
            title: 'Add New Destination',
            fields: [
                { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Amazon Rainforest' },
                { key: 'country', label: 'Country', type: 'text', placeholder: 'e.g. Brazil' },
                { key: 'tag', label: 'Tag', type: 'text', placeholder: 'e.g. Biodiversity Hotspot' },
                { key: 'rating', label: 'Rating (1–5)', type: 'number', placeholder: '4.8' },
                { key: 'price', label: 'Price', type: 'text', placeholder: 'e.g. ₹1,07,000' },
                { key: 'gradient', label: 'Gradient CSS', type: 'text', placeholder: 'linear-gradient(135deg, #065f46, #34d399)' },
            ]
        },
        sanctuary: {
            title: 'Add New Sanctuary',
            fields: [
                { key: 'name', label: 'Name', type: 'text', placeholder: 'Hidden Cenote of Yucatán' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'Mexico' },
                { key: 'type', label: 'Type', type: 'text', placeholder: 'Underground Pool' },
                { key: 'visitors', label: 'Annual Visitors', type: 'text', placeholder: '~50/year' },
                { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Moderate', 'Advanced', 'Expert'] },
                { key: 'description', label: 'Description', type: 'textarea' },
            ]
        },
        alert: {
            title: 'Add Nature Alert',
            fields: [
                { key: 'title', label: 'Alert Title', type: 'text', placeholder: 'Protected Zone' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'Amazon Basin, Sector 7' },
                { key: 'level', label: 'Alert Level', type: 'select', options: ['low', 'medium', 'high'] },
                { key: 'description', label: 'Description', type: 'textarea' },
            ]
        },
        wildlife: {
            title: 'Add Wildlife Sighting',
            fields: [
                { key: 'species', label: 'Species Name', type: 'text', placeholder: 'Bengal Tiger' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'Sundarbans, India' },
                { key: 'status', label: 'Conservation Status', type: 'select', options: ['Vulnerable', 'Endangered', 'Critically Endangered', 'Near Threatened', 'Least Concern'] },
                { key: 'sightings', label: 'No. of Sightings', type: 'number', placeholder: '5' },
            ]
        },
    };

    const canAdd = ['destinations', 'sanctuaries', 'alerts', 'wildlife'].includes(activeTab);

    return (
        <div className="dashboard-page">
            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirm.show && (
                <div className="modal-overlay" onClick={() => setConfirm(CONFIRM_NULL)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon"><AlertTriangle size={28} /></div>
                        <h3>Confirm Action</h3>
                        <p>{confirm.message}</p>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={() => setConfirm(CONFIRM_NULL)}>Cancel</button>
                            <button className="confirm-delete" onClick={async () => {
                                try { await confirm.onConfirm(); } catch { showToast('Action failed.', 'error'); }
                                setConfirm(CONFIRM_NULL);
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {addModal.show && AddModalConfig[addModal.type] && (
                <div className="modal-overlay" onClick={() => setAddModal({ show: false, type: '' })}>
                    <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setAddModal({ show: false, type: '' })}><X size={22} /></button>
                        <h2><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />{AddModalConfig[addModal.type].title}</h2>
                        <p className="modal-subtitle">Fill in the details to save to Firebase.</p>
                        <form onSubmit={handleAddSubmit} className="planner-form">
                            {AddModalConfig[addModal.type].fields.map(f => (
                                <div className="form-group" key={f.key}>
                                    <label>{f.label}</label>
                                    {f.type === 'textarea' ? (
                                        <textarea rows={3} placeholder={f.placeholder || ''} required
                                            value={addForm[f.key] || ''}
                                            onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                    ) : f.type === 'select' ? (
                                        <select required value={addForm[f.key] || ''} className="admin-select"
                                            onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}>
                                            <option value="">— Select —</option>
                                            {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input type={f.type} placeholder={f.placeholder || ''} required
                                            value={addForm[f.key] || ''}
                                            onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="submit-form-btn" disabled={saving}>
                                {saving ? <><Loader size={16} className="spin" /> Saving...</> : <><Plus size={16} /> Add to Database</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="dashboard-sidebar admin-sidebar">
                <div className="sidebar-profile">
                    <div className="sidebar-avatar admin-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                    <h3>{user?.name || 'Admin'}</h3>
                    <p>{user?.email}</p>
                    <span className="role-badge admin-role"><Shield size={10} style={{ display: 'inline', marginRight: '3px' }} />Admin</span>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab.id); setSearch(''); }}>
                            {tab.icon} {tab.label}
                            {tab.count !== undefined && <span className="sidebar-count">{tab.count}</span>}
                        </button>
                    ))}
                    <div className="sidebar-divider"></div>
                    <Link to="/" className="sidebar-link"><Eye size={18} /> View Site</Link>
                    <Link to="/planner" className="sidebar-link"><Settings size={18} /> AI Planner</Link>
                </nav>
                <button className="sidebar-logout" onClick={logout}>Sign Out</button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-topbar">
                    <div>
                        <h1>Admin <span className="gradient-text">Control Panel</span></h1>
                        <p>Manage all Tourify data connected to Firebase</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {canAdd && (
                            <button className="admin-add-btn" onClick={() => openAdd(activeTab)}>
                                <Plus size={16} /> Add New
                            </button>
                        )}
                        <button className="primary-btn" onClick={fetchAll} style={{ padding: '0.6rem 1.2rem' }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state"><Loader className="spin" size={36} /><p>Connecting to Firebase...</p></div>
                ) : (
                    <>
                        {/* ── OVERVIEW ──────────────────────────── */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="admin-stat-grid">
                                    {statCards.map((s, i) => (
                                        <div key={i} className="admin-stat-card" style={{ '--card-color': s.color }}>
                                            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                                            <div className="admin-stat-info">
                                                <h3>{s.value}</h3>
                                                <p>{s.label}</p>
                                            </div>
                                            <span className="admin-stat-change"><ArrowUpRight size={12} />{s.change}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-overview-grid">
                                    <div className="admin-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><MapPin size={16} /> Recent Trips</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('trips')}>View All</button>
                                        </div>
                                        <div className="overview-list">
                                            {trips.slice(0, 5).map((t, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: '#0de38120' }}><MapPin size={14} color="#0de381" /></div>
                                                    <div>
                                                        <strong>{t.destination}</strong>
                                                        <p>{new Date(t.startDate).toLocaleDateString('en-IN')} → {new Date(t.endDate).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    <span className={`trip-status status-${t.status || 'planned'}`}>{t.status || 'planned'}</span>
                                                </div>
                                            ))}
                                            {trips.length === 0 && <p className="no-data-msg">No trips yet.</p>}
                                        </div>
                                    </div>

                                    <div className="admin-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Mail size={16} /> Unread Messages</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('contacts')}>View All</button>
                                        </div>
                                        <div className="overview-list">
                                            {contacts.filter(c => c.status === 'unread' || !c.status).slice(0, 5).map((c, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: '#f59e0b20' }}><Mail size={14} color="#f59e0b" /></div>
                                                    <div>
                                                        <strong>{c.name}</strong>
                                                        <p style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</p>
                                                    </div>
                                                    <span className="table-badge badge-unread">unread</span>
                                                </div>
                                            ))}
                                            {contacts.filter(c => c.status === 'unread' || !c.status).length === 0 && <p className="no-data-msg">All messages read ✓</p>}
                                        </div>
                                    </div>

                                    <div className="admin-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Bell size={16} /> High Priority Alerts</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('alerts')}>Manage</button>
                                        </div>
                                        <div className="overview-list">
                                            {alerts.filter(a => a.level === 'high').slice(0, 5).map((a, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: '#ef444420' }}><AlertTriangle size={14} color="#ef4444" /></div>
                                                    <div><strong>{a.title}</strong><p>{a.location}</p></div>
                                                    <span className="alert-badge badge-high">high</span>
                                                </div>
                                            ))}
                                            {alerts.filter(a => a.level === 'high').length === 0 && <p className="no-data-msg">No high priority alerts.</p>}
                                        </div>
                                    </div>

                                    <div className="admin-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Users size={16} /> Recent Users</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('users')}>Manage</button>
                                        </div>
                                        <div className="overview-list">
                                            {users.slice(0, 5).map((u, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: u.role === 'admin' ? '#6366f120' : '#a78bfa20' }}>
                                                        <Users size={14} color={u.role === 'admin' ? '#6366f1' : '#a78bfa'} />
                                                    </div>
                                                    <div><strong>{u.name}</strong><p>{u.email}</p></div>
                                                    <span className={`role-badge ${u.role === 'admin' ? 'admin-role' : 'user-role'}`}>{u.role}</span>
                                                </div>
                                            ))}
                                            {users.length === 0 && <p className="no-data-msg">No users loaded.</p>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── TRIPS ─────────────────────────────── */}
                        {activeTab === 'trips' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><MapPin size={20} /> All Trips <span className="count-pill">{trips.length}</span></h2>
                                    <div className="search-wrap">
                                        <Search size={15} className="search-icon" />
                                        <input className="admin-search" placeholder="Search destination..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Destination</th><th>Start Date</th><th>End Date</th><th>Notes</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(trips, ['destination', 'notes']).map(t => (
                                                <tr key={t._id}>
                                                    <td><strong>{t.destination}</strong></td>
                                                    <td>{t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td>{t.endDate ? new Date(t.endDate).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td className="table-message">{t.notes || '—'}</td>
                                                    <td>
                                                        <select className="status-select" value={t.status || 'planned'} onChange={e => updateTripStatus(t._id, e.target.value)}>
                                                            <option value="planned">Planned</option>
                                                            <option value="ongoing">Ongoing</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td><button className="table-delete" onClick={() => deleteTrip(t._id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(trips, ['destination']).length === 0 && <div className="table-empty">No trips found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── DESTINATIONS ──────────────────────── */}
                        {activeTab === 'destinations' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Mountain size={20} /> Destinations <span className="count-pill">{destinations.length}</span></h2>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="search-wrap">
                                            <Search size={15} className="search-icon" />
                                            <input className="admin-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                        <button className="admin-add-btn" onClick={() => openAdd('destination')}><Plus size={15} /> Add</button>
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Country</th><th>Tag</th><th>Rating</th><th>Price</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(destinations, ['name', 'country', 'tag']).map(d => (
                                                <tr key={d._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: d.gradient, flexShrink: 0 }}></div>
                                                            <strong>{d.name}</strong>
                                                        </div>
                                                    </td>
                                                    <td>{d.country}</td>
                                                    <td><span className="table-badge type-trip">{d.tag}</span></td>
                                                    <td>⭐ {d.rating}</td>
                                                    <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{d.price}</td>
                                                    <td><button className="table-delete" onClick={() => deleteDestination(d._id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(destinations, ['name', 'country']).length === 0 && <div className="table-empty">No destinations found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── SANCTUARIES ───────────────────────── */}
                        {activeTab === 'sanctuaries' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><TreePine size={20} /> Sanctuaries <span className="count-pill">{sanctuaries.length}</span></h2>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="search-wrap">
                                            <Search size={15} className="search-icon" />
                                            <input className="admin-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                        <button className="admin-add-btn" onClick={() => openAdd('sanctuary')}><Plus size={15} /> Add</button>
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Visitors/Year</th><th>Difficulty</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(sanctuaries, ['name', 'location', 'type']).map(s => (
                                                <tr key={s._id}>
                                                    <td><strong>{s.name}</strong></td>
                                                    <td>{s.location}</td>
                                                    <td><span className="table-badge type-subscriber">{s.type}</span></td>
                                                    <td>{s.visitors}</td>
                                                    <td>
                                                        <span className={`table-badge ${s.difficulty === 'Expert' ? 'badge-high' : s.difficulty === 'Advanced' ? 'badge-medium' : 'badge-low'}`}>
                                                            {s.difficulty}
                                                        </span>
                                                    </td>
                                                    <td><button className="table-delete" onClick={() => deleteSanctuary(s._id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(sanctuaries, ['name', 'location']).length === 0 && <div className="table-empty">No sanctuaries found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── WILDLIFE ──────────────────────────── */}
                        {activeTab === 'wildlife' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Bird size={20} /> Wildlife Sightings <span className="count-pill">{wildlife.length}</span></h2>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="search-wrap">
                                            <Search size={15} className="search-icon" />
                                            <input className="admin-search" placeholder="Search species..." value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                        <button className="admin-add-btn" onClick={() => openAdd('wildlife')}><Plus size={15} /> Add</button>
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Species</th><th>Location</th><th>Conservation Status</th><th>Sightings</th><th>Last Seen</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(wildlife, ['species', 'location', 'status']).map(w => (
                                                <tr key={w._id}>
                                                    <td><strong>{w.species}</strong></td>
                                                    <td>{w.location}</td>
                                                    <td>
                                                        <span className={`table-badge ${w.status?.includes('Critically') ? 'badge-high' : w.status?.includes('Endangered') ? 'badge-medium' : 'badge-low'}`}>
                                                            {w.status}
                                                        </span>
                                                    </td>
                                                    <td>👁 {w.sightings}</td>
                                                    <td>{w.lastSeen ? new Date(w.lastSeen).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td><button className="table-delete" onClick={() => deleteSighting(w._id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(wildlife, ['species', 'location']).length === 0 && <div className="table-empty">No wildlife data found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── ALERTS ────────────────────────────── */}
                        {activeTab === 'alerts' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Bell size={20} /> Nature Alerts <span className="count-pill">{alerts.length}</span></h2>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div className="search-wrap">
                                            <Search size={15} className="search-icon" />
                                            <input className="admin-search" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                        <button className="admin-add-btn" onClick={() => openAdd('alert')}><Plus size={15} /> Add</button>
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Title</th><th>Location</th><th>Level</th><th>Description</th><th>Created</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(alerts, ['title', 'location', 'level']).map(a => (
                                                <tr key={a._id}>
                                                    <td><strong>{a.title}</strong></td>
                                                    <td>{a.location}</td>
                                                    <td><span className={`alert-badge badge-${a.level}`}>{a.level}</span></td>
                                                    <td className="table-message">{a.description}</td>
                                                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td><button className="table-delete" onClick={() => deleteAlert(a._id)}><Trash2 size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(alerts, ['title', 'location']).length === 0 && <div className="table-empty">No alerts found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── CONTACTS ──────────────────────────── */}
                        {activeTab === 'contacts' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Mail size={20} /> Contact Messages <span className="count-pill">{contacts.length}</span>
                                        {contacts.filter(c => !c.status || c.status === 'unread').length > 0 && (
                                            <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: 700, marginLeft: '0.5rem' }}>
                                                {contacts.filter(c => !c.status || c.status === 'unread').length} new
                                            </span>
                                        )}
                                    </h2>
                                    <div className="search-wrap">
                                        <Search size={15} className="search-icon" />
                                        <input className="admin-search" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(contacts, ['name', 'email', 'message']).map(c => (
                                                <tr key={c._id} style={{ opacity: c.status === 'read' ? 0.65 : 1 }}>
                                                    <td><strong>{c.name}</strong></td>
                                                    <td style={{ color: 'var(--accent-blue-green)' }}>{c.email}</td>
                                                    <td className="table-message">{c.message}</td>
                                                    <td><span className={`table-badge badge-${c.status || 'unread'}`}>{c.status || 'unread'}</span></td>
                                                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                                                        {(!c.status || c.status === 'unread') && (
                                                            <button className="table-action-btn" title="Mark as read" onClick={() => markContactRead(c._id)}>
                                                                <CheckCheck size={14} />
                                                            </button>
                                                        )}
                                                        <button className="table-delete" onClick={() => deleteContact(c._id)}><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(contacts, ['name', 'email']).length === 0 && <div className="table-empty">No messages found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── NEWSLETTER ────────────────────────── */}
                        {activeTab === 'newsletter' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Users size={20} /> Newsletter Subscribers <span className="count-pill">{newsletters.length}</span></h2>
                                    <div className="search-wrap">
                                        <Search size={15} className="search-icon" />
                                        <input className="admin-search" placeholder="Search email..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="admin-newsletter-cards">
                                    {filtered(newsletters, ['email']).map((n, i) => (
                                        <div key={n._id || i} className="newsletter-subscriber-card">
                                            <div className="ns-avatar">{n.email[0].toUpperCase()}</div>
                                            <div className="ns-info">
                                                <strong>{n.email}</strong>
                                                <p>Joined: {n.subscribedAt ? new Date(n.subscribedAt).toLocaleDateString('en-IN') : n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                                            </div>
                                            <button className="table-delete" onClick={() => deleteNewsletter(n._id)}><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    {filtered(newsletters, ['email']).length === 0 && <div className="table-empty" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center' }}>No subscribers found.</div>}
                                </div>
                            </div>
                        )}

                        {/* ── USERS ─────────────────────────────── */}
                        {activeTab === 'users' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><UserCog size={20} /> Registered Users <span className="count-pill">{users.length}</span></h2>
                                    <div className="search-wrap">
                                        <Search size={15} className="search-icon" />
                                        <input className="admin-search" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filtered(users, ['name', 'email', 'role']).map(u => (
                                                <tr key={u._id} style={{ opacity: u._id === user?.id ? 0.5 : 1 }}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: u.role === 'admin' ? '#6366f1' : 'var(--accent-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                                                                {u.name?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <strong>{u.name}</strong>
                                                            {u._id === user?.id && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(you)</span>}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--accent-blue-green)' }}>{u.email}</td>
                                                    <td>
                                                        {u._id === user?.id ? (
                                                            <span className="role-badge admin-role">admin</span>
                                                        ) : (
                                                            <select className="status-select" value={u.role || 'user'} onChange={e => updateUserRole(u._id, e.target.value)}>
                                                                <option value="user">user</option>
                                                                <option value="admin">admin</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td>
                                                        {u._id !== user?.id && (
                                                            <button className="table-delete" onClick={() => deleteUser(u._id, u.name)}><Trash2 size={14} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filtered(users, ['name', 'email']).length === 0 && <div className="table-empty">No users found.</div>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
