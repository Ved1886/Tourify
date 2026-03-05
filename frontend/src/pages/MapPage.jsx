import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Map, Loader, Users, MapPin, Search, Compass, ExternalLink } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

export default function MapPage() {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripsRes, destsRes] = await Promise.all([
                    axios.get(`${API}/trips`),
                    axios.get(`${API}/destinations`)
                ]);

                // Group trips by destination
                const tripGroups = {};
                tripsRes.data.forEach(t => {
                    const dest = t.destination || 'Unknown';
                    if (!tripGroups[dest]) tripGroups[dest] = [];
                    tripGroups[dest].push(t);
                });

                const allData = [
                    ...destsRes.data.map(d => ({ ...d, type: 'destination' })),
                    ...Object.keys(tripGroups).map(loc => ({
                        name: loc,
                        type: 'trip',
                        count: tripGroups[loc].length,
                        trips: tripGroups[loc],
                        country: tripGroups[loc][0]?.country || 'Various'
                    }))
                ];

                setMarkers(allData);
            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = markers.filter(m =>
        (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.country || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="page-header">
                <span className="section-badge"><Compass size={14} /> EXPLORER HUB</span>
                <h1>Global <span className="gradient-text">Trail Activity</span></h1>
                <p>Browse active trips and top destinations from the Tourify community.</p>
            </div>

            <div className="search-bar" style={{ marginBottom: '2rem' }}>
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search destinations or countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader className="spin" size={32} color="var(--accent-green)" />
                    <p>Loading community activity...</p>
                </div>
            ) : (
                <div className="wildlife-grid">
                    {filtered.map((item, idx) => (
                        <div key={idx} className="wildlife-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="wildlife-indicator" style={{ background: item.type === 'destination' ? 'var(--accent-green)' : '#3b82f6' }}></div>
                            <div className="wildlife-body">
                                <div className="wildlife-top">
                                    <h3>{item.name}</h3>
                                    <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                        {item.type === 'destination' ? 'Top Rated' : 'Active Trail'}
                                    </span>
                                </div>
                                <p className="wildlife-location"><MapPin size={14} /> {item.country}</p>

                                {item.type === 'trip' ? (
                                    <div style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                            <Users size={14} color="var(--accent-green)" />
                                            <strong>{item.count} Travelers</strong> active here
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {item.trips.slice(0, 3).map((t, i) => (
                                                <span key={i} style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {t.userName || 'Explorer'}
                                                </span>
                                            ))}
                                            {item.count > 3 && <span style={{ fontSize: '10px', opacity: 0.5 }}>+ {item.count - 3} more</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.5' }}>
                                        {item.tag || 'Explore the wonders of nature in this premier destination.'}
                                    </p>
                                )}

                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <a href={`/planner?dest=${encodeURIComponent(item.name)}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        Plan Trip to this location <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
