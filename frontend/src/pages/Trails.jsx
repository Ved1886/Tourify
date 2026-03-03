import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Heart, ArrowRight, Loader, Utensils, Activity, Eye, X } from 'lucide-react';


const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function Trails() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState([]);
    const [selectedDest, setSelectedDest] = useState(null);

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
                                    <button onClick={() => setSelectedDest(d)} className="explore-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Explore <ArrowRight size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDest && (
                <div className="modal-overlay" onClick={() => setSelectedDest(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="close-btn" onClick={() => setSelectedDest(null)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <div style={{ background: selectedDest.gradient, padding: '40px 20px', borderRadius: '16px 16px 0 0', marginTop: '-30px', marginLeft: '-30px', marginRight: '-30px', marginBottom: '20px', textAlign: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '2rem', color: '#fff' }}>{selectedDest.name}</h2>
                            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <MapPin size={16} /> {selectedDest.country}
                            </p>
                        </div>

                        <div style={{ color: '#fff', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0de381', fontSize: '1.2rem', margin: 0 }}><Utensils size={20} /> Famous Food</h3>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#ccc' }}>
                                    Experience authentic local cuisine. From traditional street food to hidden eco-cafes, {selectedDest.name} offers a rich palette of organic and sustainably sourced meals unique to {selectedDest.country}.
                                </p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0de381', fontSize: '1.2rem', margin: 0 }}><Activity size={20} /> Popular Activities</h3>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#ccc' }}>
                                    Engage in guided wildlife safaris, eco-friendly trailing, native community interactions, and conservation workshops taking place around the {selectedDest.tag} region.
                                </p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0de381', fontSize: '1.2rem', margin: 0 }}><Eye size={20} /> Scenic Viewpoints</h3>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#ccc' }}>
                                    Hike up to hidden observation decks or natural peaks that give you breathtaking, panoramic views of the untouched landscapes of {selectedDest.name}.
                                </p>
                            </div>

                            <Link to={`/planner?dest=${encodeURIComponent(selectedDest.name)}`} style={{ background: '#0de381', color: '#000', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                Plan Your Trip <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Trails;
