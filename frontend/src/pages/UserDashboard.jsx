import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    User, MapPin, Calendar, TreePine, Compass, X, Sparkles,
    Loader, TrendingUp, Heart, Award, Bell, Edit3, Save,
    Mail, Send, CheckCircle2, Clock, BarChart3, Trash2,
    ArrowRight, Mountain, Bird, Globe, Eye, BookOpen,
    Target, Flame, Star, Plus, RefreshCw, AlertTriangle
} from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function UserDashboard() {
    const { user, token, logout, fetchUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [trips, setTrips] = useState([]);
    const [wildlife, setWildlife] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Forms
    const [showTripForm, setShowTripForm] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [tripForm, setTripForm] = useState({ destination: '', startDate: '', endDate: '', notes: '' });
    const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
    const [contactForm, setContactForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
    const [newsletterEmail, setNewsletterEmail] = useState(user?.email || '');
    const [subStatus, setSubStatus] = useState('');

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [tripsRes, wildlifeRes, alertsRes] = await Promise.allSettled([
                axios.get(`${API}/trips`, { headers }),
                axios.get(`${API}/wildlife`),
                axios.get(`${API}/alerts`),
            ]);
            if (tripsRes.status === 'fulfilled') setTrips(tripsRes.value.data);
            if (wildlifeRes.status === 'fulfilled') setWildlife(wildlifeRes.value.data.slice(0, 6));
            if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.slice(0, 5));
        } catch (err) { console.log(err.message); }
        finally { setLoading(false); }
    };

    /* ── Trip CRUD ──────────────────────────────── */
    const handleCreateTrip = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.post(`${API}/trips`, tripForm, { headers });
            setTrips(p => [res.data, ...p]);
            setTripForm({ destination: '', startDate: '', endDate: '', notes: '' });
            setShowTripForm(false);
            showToast('Trip saved successfully! 🌿');
        } catch { showToast('Failed to save trip.', 'error'); }
        finally { setSaving(false); }
    };

    const deleteTrip = async (id) => {
        try {
            await axios.delete(`${API}/trips/${id}`, { headers });
            setTrips(p => p.filter(t => t._id !== id));
            showToast('Trip removed.');
        } catch { showToast('Failed to delete.', 'error'); }
    };

    const updateTripStatus = async (id, status) => {
        try {
            await axios.put(`${API}/trips/${id}`, { status }, { headers });
            setTrips(p => p.map(t => t._id === id ? { ...t, status } : t));
            showToast(`Trip marked as "${status}".`);
        } catch { showToast('Failed to update.', 'error'); }
    };

    /* ── Profile Update ─────────────────────────── */
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API}/users/me`, profileForm, { headers });
            await fetchUser();
            setEditingProfile(false);
            showToast('Profile updated!');
        } catch { showToast('Failed to update profile.', 'error'); }
        finally { setSaving(false); }
    };

    /* ── Contact Form ───────────────────────────── */
    const handleContact = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API}/contact`, contactForm);
            setContactForm({ name: user?.name || '', email: user?.email || '', message: '' });
            showToast('Message sent! We\'ll get back to you soon. 📬');
        } catch { showToast('Failed to send message.', 'error'); }
        finally { setSaving(false); }
    };

    /* ── Newsletter ─────────────────────────────── */
    const handleSubscribe = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API}/newsletter`, { email: newsletterEmail });
            setSubStatus('success');
            showToast('Subscribed to Tourify newsletter! 🌱');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to subscribe.';
            if (msg.includes('already')) { setSubStatus('exists'); showToast('You\'re already subscribed!', 'error'); }
            else { showToast(msg, 'error'); }
        }
        finally { setSaving(false); }
    };

    /* ── Stats ──────────────────────────────────── */
    const stats = [
        { label: 'Saved Trips', value: trips.length, icon: <TreePine size={22} />, color: '#0de381', bg: 'rgba(13,227,129,0.1)' },
        { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, icon: <CheckCircle2 size={22} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
        { label: 'Upcoming', value: trips.filter(t => !t.status || t.status === 'planned').length, icon: <Clock size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Destinations', value: new Set(trips.map(t => t.destination)).size, icon: <MapPin size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
        { id: 'trips', label: 'My Trips', icon: <MapPin size={17} />, count: trips.length },
        { id: 'wildlife', label: 'Wildlife', icon: <Bird size={17} /> },
        { id: 'alerts', label: 'Alerts', icon: <Bell size={17} />, count: alerts.length },
        { id: 'contact', label: 'Contact', icon: <Mail size={17} /> },
        { id: 'profile', label: 'Profile', icon: <User size={17} /> },
    ];

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="dashboard-page">
            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* New Trip Modal */}
            {showTripForm && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTripForm(false)}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowTripForm(false)}><X size={22} /></button>
                        <h2><Sparkles size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Plan New Trip</h2>
                        <p className="modal-subtitle">Save a new nature adventure to your log.</p>
                        <form onSubmit={handleCreateTrip} className="planner-form">
                            <div className="form-group">
                                <label>Destination</label>
                                <input type="text" required placeholder="e.g. Amazon Rainforest, India"
                                    value={tripForm.destination}
                                    onChange={e => setTripForm(p => ({ ...p, destination: e.target.value }))} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input type="date" required value={tripForm.startDate}
                                        onChange={e => setTripForm(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input type="date" required value={tripForm.endDate}
                                        onChange={e => setTripForm(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes (optional)</label>
                                <textarea rows={3} placeholder="What are you hoping to experience?"
                                    value={tripForm.notes}
                                    onChange={e => setTripForm(p => ({ ...p, notes: e.target.value }))} />
                            </div>
                            <button type="submit" className="submit-form-btn" disabled={saving}>
                                {saving ? <><Loader size={16} className="spin" /> Saving...</> : <><Sparkles size={16} /> Save Trip</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <h3>{user?.name || 'Explorer'}</h3>
                    <p>{user?.email}</p>
                    <span className="role-badge user-role"><Globe size={10} style={{ display: 'inline', marginRight: '3px' }} />Explorer</span>
                </div>

                {/* Quick Stats */}
                <div className="sidebar-quick-stats">
                    <div className="sidebar-qs-item">
                        <span className="sidebar-qs-val">{trips.length}</span>
                        <span className="sidebar-qs-label">Trips</span>
                    </div>
                    <div className="sidebar-qs-divider"></div>
                    <div className="sidebar-qs-item">
                        <span className="sidebar-qs-val">{trips.filter(t => t.status === 'completed').length}</span>
                        <span className="sidebar-qs-label">Done</span>
                    </div>
                    <div className="sidebar-qs-divider"></div>
                    <div className="sidebar-qs-item">
                        <span className="sidebar-qs-val">{new Set(trips.map(t => t.destination)).size}</span>
                        <span className="sidebar-qs-label">Places</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            {tab.icon} {tab.label}
                            {tab.count !== undefined && <span className="sidebar-count">{tab.count}</span>}
                        </button>
                    ))}
                    <div className="sidebar-divider"></div>
                    <Link to="/planner" className="sidebar-link"><Compass size={17} /> AI Planner</Link>
                    <Link to="/trails" className="sidebar-link"><Mountain size={17} /> Explore Trails</Link>
                    <Link to="/wildlife" className="sidebar-link"><Bird size={17} /> Wildlife</Link>
                    <Link to="/" className="sidebar-link"><Eye size={17} /> View Site</Link>
                </nav>
                <button className="sidebar-logout" onClick={logout}>Sign Out</button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <div className="dashboard-topbar">
                    <div>
                        <h1>{getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Explorer'}</span> 👋</h1>
                        <p>Your personal nature travel dashboard</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="primary-btn" onClick={() => { setShowTripForm(true); }}>
                            <Plus size={17} /> New Trip
                        </button>
                        <button className="primary-btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={fetchAll}>
                            <RefreshCw size={17} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state"><Loader className="spin" size={36} /><p>Loading your dashboard...</p></div>
                ) : (
                    <>
                        {/* ── OVERVIEW ──────────────────── */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Stat Cards */}
                                <div className="user-stat-grid">
                                    {stats.map((s, i) => (
                                        <div key={i} className="user-stat-card" style={{ '--card-color': s.color }}>
                                            <div className="user-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                                            <div>
                                                <h3>{s.value}</h3>
                                                <p>{s.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Overview Grid */}
                                <div className="user-overview-grid">
                                    {/* Upcoming Trips */}
                                    <div className="user-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Calendar size={16} /> Upcoming Trips</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('trips')}>View All</button>
                                        </div>
                                        <div className="overview-list">
                                            {trips.filter(t => !t.status || t.status === 'planned').slice(0, 4).map((t, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: '#6366f120' }}>
                                                        <MapPin size={13} color="#6366f1" />
                                                    </div>
                                                    <div>
                                                        <strong>{t.destination}</strong>
                                                        <p>{t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN') : '—'}</p>
                                                    </div>
                                                    <span className="trip-status status-planned">planned</span>
                                                </div>
                                            ))}
                                            {trips.filter(t => !t.status || t.status === 'planned').length === 0 && (
                                                <div className="no-data-msg" style={{ padding: '1.5rem' }}>
                                                    No upcoming trips. <button className="tab-link-btn" style={{ display: 'inline' }} onClick={() => setShowTripForm(true)}>Plan one!</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nature Alerts */}
                                    <div className="user-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Bell size={16} /> Nature Alerts</h3>
                                            <button className="tab-link-btn" onClick={() => setActiveTab('alerts')}>View All</button>
                                        </div>
                                        <div className="overview-list">
                                            {alerts.slice(0, 4).map((a, i) => (
                                                <div key={i} className="overview-item">
                                                    <div className="overview-item-icon" style={{ background: a.level === 'high' ? '#ef444420' : a.level === 'medium' ? '#f59e0b20' : '#0de38120' }}>
                                                        <Bell size={13} color={a.level === 'high' ? '#ef4444' : a.level === 'medium' ? '#f59e0b' : '#0de381'} />
                                                    </div>
                                                    <div>
                                                        <strong>{a.title}</strong>
                                                        <p>{a.location}</p>
                                                    </div>
                                                    <span className={`alert-badge badge-${a.level}`}>{a.level}</span>
                                                </div>
                                            ))}
                                            {alerts.length === 0 && <p className="no-data-msg">No active alerts.</p>}
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="user-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Compass size={16} /> Explore</h3>
                                        </div>
                                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {[
                                                { to: '/planner', icon: <Sparkles size={16} />, label: 'AI Trip Planner', sub: 'Generate a day-wise itinerary', color: '#0de381' },
                                                { to: '/trails', icon: <Mountain size={16} />, label: 'Explore Trails', sub: 'Discover eco destinations', color: '#22d3ee' },
                                                { to: '/sanctuary', icon: <TreePine size={16} />, label: 'Secret Sanctuaries', sub: 'Hidden natural wonders', color: '#6366f1' },
                                                { to: '/wildlife', icon: <Bird size={16} />, label: 'Wildlife Tracker', sub: 'Live sighting reports', color: '#ec4899' },
                                            ].map((item, i) => (
                                                <Link key={i} to={item.to} className="user-quick-link">
                                                    <div className="user-ql-icon" style={{ background: `${item.color}20`, color: item.color }}>{item.icon}</div>
                                                    <div>
                                                        <strong>{item.label}</strong>
                                                        <p>{item.sub}</p>
                                                    </div>
                                                    <ArrowRight size={15} className="user-ql-arrow" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress / Achievements */}
                                    <div className="user-overview-card">
                                        <div className="admin-overview-header">
                                            <h3><Award size={16} /> Your Progress</h3>
                                        </div>
                                        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                                            {[
                                                { label: 'Trips Completed', current: trips.filter(t => t.status === 'completed').length, total: 10, color: '#0de381' },
                                                { label: 'Destinations Visited', current: new Set(trips.map(t => t.destination)).size, total: 20, color: '#6366f1' },
                                                {
                                                    label: 'Days Exploring', current: trips.reduce((acc, t) => {
                                                        if (t.startDate && t.endDate) {
                                                            const diff = Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24));
                                                            return acc + Math.max(0, diff);
                                                        }
                                                        return acc;
                                                    }, 0), total: 100, color: '#f59e0b'
                                                },
                                            ].map((item, i) => (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.83rem' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                                        <span style={{ fontWeight: 700, color: item.color }}>{item.current} / {item.total}</span>
                                                    </div>
                                                    <div className="user-progress-bar">
                                                        <div className="user-progress-fill" style={{ width: `${Math.min((item.current / item.total) * 100, 100)}%`, background: item.color }}></div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Badges */}
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>ACHIEVEMENTS</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {trips.length >= 1 && <span className="user-badge"><Flame size={12} />First Trip</span>}
                                                    {trips.filter(t => t.status === 'completed').length >= 3 && <span className="user-badge" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}><Star size={12} />Veteran</span>}
                                                    {new Set(trips.map(t => t.destination)).size >= 5 && <span className="user-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><Globe size={12} />Explorer</span>}
                                                    {trips.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Complete trips to earn badges!</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── MY TRIPS ──────────────────── */}
                        {activeTab === 'trips' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><MapPin size={20} /> My Trips <span className="count-pill">{trips.length}</span></h2>
                                    <button className="admin-add-btn" onClick={() => setShowTripForm(true)}>
                                        <Plus size={15} /> Plan Trip
                                    </button>
                                </div>

                                {trips.length === 0 ? (
                                    <div className="user-empty-state">
                                        <div className="user-empty-icon"><TreePine size={44} /></div>
                                        <h3>No trips planned yet</h3>
                                        <p>Start your nature journey by planning your first trip.</p>
                                        <button className="primary-btn" onClick={() => setShowTripForm(true)}>
                                            <Sparkles size={17} /> Plan Your First Trip
                                        </button>
                                    </div>
                                ) : (
                                    <div className="user-trips-grid">
                                        {trips.map(trip => (
                                            <div key={trip._id} className={`user-trip-card status-card-${trip.status || 'planned'}`}>
                                                <div className="user-trip-header">
                                                    <div className="user-trip-icon">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4>{trip.destination}</h4>
                                                        <p className="user-trip-dates">
                                                            <Calendar size={12} />
                                                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN') : '?'} →{' '}
                                                            {trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-IN') : '?'}
                                                        </p>
                                                    </div>
                                                    <button className="user-trip-delete" onClick={() => deleteTrip(trip._id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {trip.notes && <p className="user-trip-notes">{trip.notes}</p>}
                                                <div className="user-trip-footer">
                                                    <select className="status-select"
                                                        value={trip.status || 'planned'}
                                                        onChange={e => updateTripStatus(trip._id, e.target.value)}>
                                                        <option value="planned">🗓 Planned</option>
                                                        <option value="ongoing">🚀 Ongoing</option>
                                                        <option value="completed">✅ Completed</option>
                                                        <option value="cancelled">❌ Cancelled</option>
                                                    </select>
                                                    <Link to="/planner" className="user-trip-plan-btn">
                                                        <Sparkles size={13} /> AI Plan
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── WILDLIFE ──────────────────── */}
                        {activeTab === 'wildlife' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Bird size={20} /> Wildlife Sightings <span className="count-pill">{wildlife.length}</span></h2>
                                    <Link to="/wildlife" className="admin-add-btn" style={{ textDecoration: 'none' }}>
                                        <Eye size={15} /> See All
                                    </Link>
                                </div>
                                <div className="user-wildlife-grid">
                                    {wildlife.map((w, i) => (
                                        <div key={i} className="user-wildlife-card">
                                            <div className="user-wildlife-icon">
                                                <Bird size={24} />
                                            </div>
                                            <div className="user-wildlife-info">
                                                <h4>{w.species}</h4>
                                                <p><MapPin size={11} /> {w.location}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                    <span className={`table-badge ${w.status?.includes('Critically') ? 'badge-high' : w.status?.includes('Endangered') ? 'badge-medium' : 'badge-low'}`}>
                                                        {w.status}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👁 {w.sightings} sighted</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {wildlife.length === 0 && (
                                        <div className="user-empty-state" style={{ gridColumn: '1/-1' }}>
                                            <div className="user-empty-icon"><Bird size={44} /></div>
                                            <h3>No sightings yet</h3>
                                            <p>Check back later for wildlife reports.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── ALERTS ────────────────────── */}
                        {activeTab === 'alerts' && (
                            <div className="dash-section">
                                <div className="section-toolbar">
                                    <h2><Bell size={20} /> Nature Alerts <span className="count-pill">{alerts.length}</span></h2>
                                </div>
                                <div className="user-alerts-list">
                                    {alerts.map((a, i) => (
                                        <div key={i} className={`user-alert-card alert-level-${a.level}`}>
                                            <div className="user-alert-icon">
                                                <Bell size={20} />
                                            </div>
                                            <div className="user-alert-body">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <h4>{a.title}</h4>
                                                    <span className={`alert-badge badge-${a.level}`}>{a.level}</span>
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', margin: '0.3rem 0' }}>
                                                    <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />{a.location}
                                                </p>
                                                <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{a.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {alerts.length === 0 && (
                                        <div className="user-empty-state">
                                            <div className="user-empty-icon"><Bell size={44} /></div>
                                            <h3>No active alerts</h3>
                                            <p>All clear! No nature alerts at this time.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── CONTACT ───────────────────── */}
                        {activeTab === 'contact' && (
                            <div className="dash-section">
                                <div style={{ maxWidth: '640px' }}>
                                    <h2><Mail size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Contact Us</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.92rem' }}>
                                        Have questions or feedback? We'd love to hear from you.
                                    </p>

                                    <form onSubmit={handleContact} className="planner-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Your Name</label>
                                                <input type="text" required placeholder="Your name"
                                                    value={contactForm.name}
                                                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} />
                                            </div>
                                            <div className="form-group">
                                                <label>Your Email</label>
                                                <input type="email" required placeholder="you@example.com"
                                                    value={contactForm.email}
                                                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Message</label>
                                            <textarea rows={5} required placeholder="Tell us about your experience, suggestions, or any issues..."
                                                value={contactForm.message}
                                                onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} />
                                        </div>
                                        <button type="submit" className="submit-form-btn" disabled={saving}>
                                            {saving ? <><Loader size={16} className="spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                                        </button>
                                    </form>

                                    {/* Newsletter Section */}
                                    <div className="user-newsletter-box">
                                        <div className="user-newsletter-icon"><Bell size={22} /></div>
                                        <div>
                                            <h3>Stay in the Loop 🌿</h3>
                                            <p>Get weekly nature alerts, rare wildlife sightings, and new trail discoveries.</p>
                                        </div>
                                        {subStatus === 'success' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                                                <CheckCircle2 size={20} /> Subscribed!
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubscribe} className="user-nl-form">
                                                <input type="email" required placeholder="your@email.com"
                                                    value={newsletterEmail}
                                                    onChange={e => setNewsletterEmail(e.target.value)} />
                                                <button type="submit" disabled={saving}>
                                                    {saving ? <Loader size={14} className="spin" /> : 'Subscribe'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PROFILE ───────────────────── */}
                        {activeTab === 'profile' && (
                            <div className="dash-section">
                                <div style={{ maxWidth: '600px' }}>
                                    <h2><User size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />My Profile</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.92rem' }}>
                                        Manage your account settings and preferences.
                                    </p>

                                    {/* Profile Card */}
                                    <div className="user-profile-card">
                                        <div className="user-profile-avatar">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="user-profile-meta">
                                            <h3>{user?.name}</h3>
                                            <p>{user?.email}</p>
                                            <span className="role-badge user-role" style={{ marginTop: '0.4rem', display: 'inline-block' }}>Explorer</span>
                                        </div>
                                        <button className="user-edit-btn" onClick={() => { setProfileForm({ name: user?.name || '' }); setEditingProfile(!editingProfile); }}>
                                            {editingProfile ? <X size={16} /> : <Edit3 size={16} />}
                                            {editingProfile ? 'Cancel' : 'Edit'}
                                        </button>
                                    </div>

                                    {/* Edit Form */}
                                    {editingProfile && (
                                        <form onSubmit={handleProfileSave} className="planner-form" style={{ marginTop: '1.5rem' }}>
                                            <div className="form-group">
                                                <label>Display Name</label>
                                                <input type="text" required placeholder="Your name"
                                                    value={profileForm.name}
                                                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                                            </div>
                                            <button type="submit" className="submit-form-btn" disabled={saving}>
                                                {saving ? <><Loader size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                                            </button>
                                        </form>
                                    )}

                                    {/* Account Stats */}
                                    <div className="user-profile-stats">
                                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}><BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />Activity Summary</h3>
                                        <div className="user-profile-stat-grid">
                                            {[
                                                { label: 'Total Trips', value: trips.length, icon: <TreePine size={18} />, color: '#0de381' },
                                                { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, icon: <CheckCircle2 size={18} />, color: '#22d3ee' },
                                                { label: 'Pending', value: trips.filter(t => !t.status || t.status === 'planned').length, icon: <Clock size={18} />, color: '#6366f1' },
                                                { label: 'Cancelled', value: trips.filter(t => t.status === 'cancelled').length, icon: <X size={18} />, color: '#ef4444' },
                                            ].map((s, i) => (
                                                <div key={i} className="user-prof-stat-card" style={{ borderColor: `${s.color}30` }}>
                                                    <div style={{ color: s.color }}>{s.icon}</div>
                                                    <div>
                                                        <h4 style={{ color: s.color }}>{s.value}</h4>
                                                        <p>{s.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="user-danger-zone">
                                        <h3><AlertTriangle size={16} /> Account Actions</h3>
                                        <p>Signing out will end your current session.</p>
                                        <button className="user-signout-btn" onClick={logout}>Sign Out of Tourify</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default UserDashboard;
