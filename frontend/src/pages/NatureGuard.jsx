import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, Leaf, Droplets, Wind, TreePine, Loader } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const iconMap = {
    high: <AlertTriangle />,
    medium: <Wind />,
    low: <Leaf />
};

function NatureGuard() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/alerts`);
                setAlerts(res.data);
            } catch (err) { console.log(err.message); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const highCount = alerts.filter(a => a.level === 'high').length;
    const medCount = alerts.filter(a => a.level === 'medium').length;
    const lowCount = alerts.filter(a => a.level === 'low').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Shield size={14} /> NATURE GUARD</span>
                <h1>Protect While <span className="gradient-text">You Explore</span></h1>
                <p>Real-time ecological alerts, conservation zones, and sustainability guidelines powered by AI monitoring.</p>
            </div>

            <div className="guard-stats">
                <div className="guard-stat-card">
                    <h3>{alerts.length}</h3>
                    <p>Total Alerts</p>
                </div>
                <div className="guard-stat-card">
                    <h3>{highCount}</h3>
                    <p>High Priority</p>
                </div>
                <div className="guard-stat-card">
                    <h3>{medCount}</h3>
                    <p>Medium Priority</p>
                </div>
                <div className="guard-stat-card">
                    <h3>{lowCount}</h3>
                    <p>Low Priority</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state"><Loader className="spin" size={32} /><p>Loading alerts...</p></div>
            ) : alerts.length === 0 ? (
                <div className="empty-state">
                    <Shield size={48} />
                    <h3>No alerts</h3>
                    <p>Run the seed endpoint to populate data.</p>
                </div>
            ) : (
                <div className="alerts-list">
                    {alerts.map((a) => (
                        <div key={a._id} className={`alert-card alert-${a.level}`}>
                            <div className="alert-icon">{iconMap[a.level]}</div>
                            <div className="alert-content">
                                <div className="alert-top">
                                    <h3>{a.title}</h3>
                                    <span className={`alert-badge badge-${a.level}`}>
                                        {a.level === 'high' ? '🔴 High' : a.level === 'medium' ? '🟡 Medium' : '🟢 Low'}
                                    </span>
                                </div>
                                <p className="alert-location">{a.location}</p>
                                <p className="alert-desc">{a.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NatureGuard;
