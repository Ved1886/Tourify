import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Shield, Users, MapPin, Mail, Bird, FileText, Calendar, X,
    Loader, TrendingUp, Eye, Trash2, BarChart3, Settings
} from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function AdminDashboard() {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [trips, setTrips] = useState([]);
    const [users, setUsers] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [wildlife, setWildlife] = useState([]);
    const [loading, setLoading] = useState(true);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [tripsRes, newsletterRes, contactRes, wildlifeRes] = await Promise.all([
                axios.get(`${API}/trips`, { headers }),
                axios.get(`${API}/newsletter`, { headers }),
                axios.get(`${API}/contact`, { headers }),
                axios.get(`${API}/wildlife`, { headers })
            ]);
            setTrips(tripsRes.data);
            setNewsletters(newsletterRes.data);
            setContacts(contactRes.data);
            setWildlife(wildlifeRes.data);
        } catch (err) { console.log(err.message); }
        finally { setLoading(false); }
    };

    const deleteTrip = async (id) => {
        await axios.delete(`${API}/trips/${id}`, { headers });
        fetchAll();
    };

    const deleteContact = async (id) => {
        await axios.delete(`${API}/contact/${id}`, { headers });
        fetchAll();
    };

    const deleteNewsletter = async (email) => {
        await axios.delete(`${API}/newsletter/${email}`, { headers });
        fetchAll();
    };

    const deleteSighting = async (id) => {
        await axios.delete(`${API}/wildlife/${id}`, { headers });
        fetchAll();
    };

    const stats = [
        { icon: <MapPin />, label: 'Total Trips', value: trips.length, color: '#0de381' },
        { icon: <Mail />, label: 'Subscribers', value: newsletters.length, color: '#6366f1' },
        { icon: <FileText />, label: 'Messages', value: contacts.length, color: '#f59e0b' },
        { icon: <Bird />, label: 'Sightings', value: wildlife.length, color: '#22d3ee' }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
        { id: 'trips', label: 'Trips', icon: <MapPin size={18} /> },
        { id: 'contacts', label: 'Messages', icon: <Mail size={18} /> },
        { id: 'newsletter', label: 'Subscribers', icon: <Users size={18} /> },
        { id: 'wildlife', label: 'Wildlife', icon: <Bird size={18} /> }
    ];

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="dashboard-sidebar admin-sidebar">
                <div className="sidebar-profile">
                    <div className="sidebar-avatar admin-avatar">{user?.name?.[0] || 'A'}</div>
                    <h3>{user?.name || 'Admin'}</h3>
                    <p>{user?.email}</p>
                    <span className="role-badge admin-role">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                    <div className="sidebar-divider"></div>
                    <Link to="/" className="sidebar-link"><Eye size={18} /> View Site</Link>
                    <Link to="/planner" className="sidebar-link"><Settings size={18} /> AI Planner</Link>
                </nav>
                <button className="sidebar-logout" onClick={logout}>Sign Out</button>
            </aside>

            {/* Main */}
            <main className="dashboard-main">
                <div className="dashboard-topbar">
                    <div>
                        <h1>Admin <span className="gradient-text">Panel</span></h1>
                        <p>Manage Tourify platform data</p>
                    </div>
                    <button className="primary-btn" onClick={fetchAll}>
                        <TrendingUp size={18} /> Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state"><Loader className="spin" size={32} /><p>Loading dashboard...</p></div>
                ) : (
                    <>
                        {/* Stats - always visible */}
                        <div className="dash-stats">
                            {stats.map((s, i) => (
                                <div key={i} className="dash-stat-card" style={{ borderColor: `${s.color}33` }}>
                                    <div style={{ color: s.color }}>{s.icon}</div>
                                    <div>
                                        <h3>{s.value}</h3>
                                        <p>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overview */}
                        {activeTab === 'overview' && (
                            <div className="dash-section">
                                <h2>Recent Activity</h2>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Details</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...trips.slice(0, 3).map(t => ({ type: 'Trip', detail: t.destination, date: t.createdAt })),
                                            ...contacts.slice(0, 3).map(c => ({ type: 'Message', detail: `${c.name}: ${c.message?.substring(0, 40)}...`, date: c.createdAt })),
                                            ...newsletters.slice(0, 3).map(n => ({ type: 'Subscriber', detail: n.email, date: n.subscribedAt }))
                                            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8).map((item, i) => (
                                                <tr key={i}>
                                                    <td><span className={`table-badge type-${item.type.toLowerCase()}`}>{item.type}</span></td>
                                                    <td>{item.detail}</td>
                                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Trips Tab */}
                        {activeTab === 'trips' && (
                            <div className="dash-section">
                                <h2>All Trips ({trips.length})</h2>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Destination</th>
                                                <th>Start</th>
                                                <th>End</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trips.map(t => (
                                                <tr key={t._id}>
                                                    <td><strong>{t.destination}</strong></td>
                                                    <td>{new Date(t.startDate).toLocaleDateString()}</td>
                                                    <td>{new Date(t.endDate).toLocaleDateString()}</td>
                                                    <td><span className={`trip-status status-${t.status || 'planned'}`}>{t.status || 'planned'}</span></td>
                                                    <td>
                                                        <button className="table-delete" onClick={() => deleteTrip(t._id)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Contacts Tab */}
                        {activeTab === 'contacts' && (
                            <div className="dash-section">
                                <h2>Contact Messages ({contacts.length})</h2>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Message</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contacts.map(c => (
                                                <tr key={c._id}>
                                                    <td><strong>{c.name}</strong></td>
                                                    <td>{c.email}</td>
                                                    <td className="table-message">{c.message}</td>
                                                    <td><span className={`table-badge badge-${c.status}`}>{c.status}</span></td>
                                                    <td>
                                                        <button className="table-delete" onClick={() => deleteContact(c._id)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Newsletter Tab */}
                        {activeTab === 'newsletter' && (
                            <div className="dash-section">
                                <h2>Newsletter Subscribers ({newsletters.length})</h2>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Subscribed On</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newsletters.map(n => (
                                                <tr key={n._id}>
                                                    <td>{n.email}</td>
                                                    <td>{new Date(n.subscribedAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="table-delete" onClick={() => deleteNewsletter(n.email)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Wildlife Tab */}
                        {activeTab === 'wildlife' && (
                            <div className="dash-section">
                                <h2>Wildlife Sightings ({wildlife.length})</h2>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Species</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Sightings</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wildlife.map(w => (
                                                <tr key={w._id}>
                                                    <td><strong>{w.species}</strong></td>
                                                    <td>{w.location}</td>
                                                    <td><span className="table-badge">{w.status}</span></td>
                                                    <td>{w.sightings}</td>
                                                    <td>
                                                        <button className="table-delete" onClick={() => deleteSighting(w._id)}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
