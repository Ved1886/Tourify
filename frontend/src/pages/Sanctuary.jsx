import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Globe, MapPin, Star, Users, Loader } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function Sanctuary() {
    const [sanctuaries, setSanctuaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/sanctuaries`);
                setSanctuaries(res.data);
            } catch (err) { console.log(err.message); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Globe size={14} /> SANCTUARIES</span>
                <h1>Earth's Best Kept <span className="gradient-text">Secrets</span></h1>
                <p>AI-discovered hidden gems most travelers will never find. Pristine, protected, and waiting for you.</p>
            </div>

            {loading ? (
                <div className="loading-state"><Loader className="spin" size={32} /><p>Loading sanctuaries...</p></div>
            ) : sanctuaries.length === 0 ? (
                <div className="empty-state">
                    <Globe size={48} />
                    <h3>No sanctuaries found</h3>
                    <p>Run the seed endpoint to populate data.</p>
                </div>
            ) : (
                <div className="sanctuary-grid">
                    {sanctuaries.map((s) => (
                        <div key={s._id} className="sanctuary-card">
                            <div className="sanctuary-img" style={{ background: s.gradient }}>
                                <span className="destination-tag">{s.type}</span>
                            </div>
                            <div className="sanctuary-body">
                                <h3>{s.name}</h3>
                                <p className="sanctuary-location"><MapPin size={14} /> {s.location}</p>
                                <p className="sanctuary-desc">{s.description}</p>
                                <div className="sanctuary-meta">
                                    <span><Users size={14} /> {s.visitors}</span>
                                    <span><Star size={14} /> {s.difficulty}</span>
                                </div>
                                <Link to={`/planner?dest=${encodeURIComponent(s.name)}`} className="explore-btn full-width">Plan Visit</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Sanctuary;
