import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Heart, ArrowRight, Loader } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Trails() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/destinations`);
                setDestinations(res.data);
            } catch (err) { console.log(err.message); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const toggleLike = (i) => {
        setLiked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><MapPin size={14} /> EXPLORE TRAILS</span>
                <h1>Earth's Hidden <span className="gradient-text">Wonders</span></h1>
                <p>AI-curated destinations that prioritize conservation and authentic experiences.</p>
            </div>

            {loading ? (
                <div className="loading-state"><Loader className="spin" size={32} /><p>Loading destinations...</p></div>
            ) : destinations.length === 0 ? (
                <div className="empty-state">
                    <MapPin size={48} />
                    <h3>No destinations yet</h3>
                    <p>Run the seed endpoint to populate data.</p>
                </div>
            ) : (
                <div className="destinations-grid">
                    {destinations.map((d, i) => (
                        <div key={d._id} className="destination-card">
                            <div className="destination-img" style={{ background: d.gradient }}>
                                <span className="destination-tag">{d.tag}</span>
                                <button className={`heart-btn ${liked.includes(i) ? 'liked' : ''}`} onClick={() => toggleLike(i)}>
                                    <Heart size={18} fill={liked.includes(i) ? '#ef4444' : 'none'} />
                                </button>
                            </div>
                            <div className="destination-info">
                                <div className="destination-header">
                                    <div>
                                        <h3>{d.name}</h3>
                                        <p className="destination-country"><MapPin size={14} /> {d.country}</p>
                                    </div>
                                    <div className="destination-rating">
                                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {d.rating}
                                    </div>
                                </div>
                                <div className="destination-footer">
                                    <span className="destination-price">From <strong>{d.price}</strong></span>
                                    <Link to="/planner" className="explore-btn">Explore <ArrowRight size={14} /></Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Trails;
