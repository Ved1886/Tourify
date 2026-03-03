import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    User, MapPin, Calendar, TreePine, Compass, X, Sparkles,
    Loader, ArrowRight, TrendingUp, Heart, Award
} from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function UserDashboard() {
    const { user, token, logout } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        destination: '', startDate: '', endDate: '', notes: ''
    });

    useEffect(() => { fetchTrips(); }, []);

    const fetchTrips = async () => {
        try {
            const res = await axios.get(`${API}/trips`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrips(res.data);
        } catch (err) { console.log(err.message); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API}/trips`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({ destination: '', startDate: '', endDate: '', notes: '' });
            setShowForm(false);
            fetchTrips();
        } catch (err) { alert('Failed to save trip'); }
        finally { setSaving(false); }
    };

    const deleteTrip = async (id) => {
        try {
            await axios.delete(`${API}/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTrips();
        } catch (err) { alert('Failed to delete'); }
    };

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{user?.name?.[0] || 'U'}</div>
                    <h3>{user?.name || 'Traveler'}</h3>
                    <p>{user?.email}</p>
                    <span className="role-badge user-role">User</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link active"><User size={18} /> Dashboard</Link>
                    <Link to="/planner" className="sidebar-link"><Compass size={18} /> AI Planner</Link>
                    <Link to="/trails" className="sidebar-link"><MapPin size={18} /> Trails</Link>
                    <Link to="/wildlife" className="sidebar-link"><Heart size={18} /> Wildlife</Link>
                    <Link to="/log" className="sidebar-link"><TreePine size={18} /> My Log</Link>
                </nav>
                <button className="sidebar-logout" onClick={logout}>Sign Out</button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-topbar">
                    <div>
                        <h1>Welcome, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Explorer'}</span></h1>
                        <p>Your personal nature dashboard</p>
                    </div>
                    <button className="primary-btn" onClick={() => setShowForm(true)}>
                        <Sparkles size={18} /> New Trail
                    </button>
                </div>

                {/* Stats */}
                <div className="dash-stats">
                    <div className="dash-stat-card">
                        <TreePine size={22} />
                        <div>
                            <h3>{trips.length}</h3>
                            <p>Saved Trails</p>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <TrendingUp size={22} />
                        <div>
                            <h3>{trips.filter(t => t.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <Calendar size={22} />
                        <div>
                            <h3>{trips.filter(t => t.status === 'planned').length}</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>
                    <div className="dash-stat-card">
                        <Award size={22} />
                        <div>
                            <h3>
                                {(() => {
                                    const d = new Set(trips.map(t => t.destination));
                                    return d.size;
                                })()}
                            </h3>
                            <p>Destinations</p>
                        </div>
                    </div>
                </div>

                {/* Trips */}
                <div className="dash-section">
                    <h2>Your Trails</h2>
                    {loading ? (
                        <div className="loading-state"><Loader className="spin" size={28} /><p>Loading...</p></div>
                    ) : trips.length === 0 ? (
                        <div className="empty-state">
                            <TreePine size={40} />
                            <h3>No trails yet</h3>
                            <p>Click "New Trail" to plan your first adventure!</p>
                        </div>
                    ) : (
                        <div className="trips-grid">
                            {trips.map(trip => (
                                <div key={trip._id} className="trip-card">
                                    <div className="trip-card-header">
                                        <h3><TreePine size={18} /> {trip.destination}</h3>
                                        <button className="delete-trip" onClick={() => deleteTrip(trip._id)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <p className="trip-dates">
                                        <Calendar size={14} /> {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="trip-notes">{trip.notes || 'An adventure awaits...'}</p>
                                    <span className={`trip-status status-${trip.status || 'planned'}`}>
                                        {trip.status || 'planned'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Trip Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                        <h2><Sparkles size={24} /> New Trail</h2>
                        <p className="modal-subtitle">Plan a new nature escape.</p>
                        <form onSubmit={handleCreate} className="planner-form">
                            <div className="form-group">
                                <label>Destination</label>
                                <input type="text" required placeholder="e.g. Amazon Rainforest"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input type="date" required value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input type="date" required value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea rows="3" placeholder="What are you looking for?"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="submit-form-btn" disabled={saving}>
                                {saving ? <><Loader className="spin" size={18} /> Saving...</> : <><Sparkles size={18} /> Save Trail</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDashboard;
