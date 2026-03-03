import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bird, MapPin, Clock, Eye, Search, Loader } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

const statusColors = {
    'Endangered': '#f59e0b',
    'Critically Endangered': '#dc2626',
    'Vulnerable': '#8b5cf6',
    'Near Threatened': '#10b981',
    'Least Concern': '#6b7280'
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function Wildlife() {
    const [wildlife, setWildlife] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/wildlife`);
                setWildlife(res.data);
            } catch (err) { console.log(err.message); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const filtered = wildlife.filter(w =>
        w.species.toLowerCase().includes(search.toLowerCase()) ||
        w.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Bird size={14} /> WILDLIFE TRACKER</span>
                <h1>Real-Time <span className="gradient-text">Sightings</span></h1>
                <p>Live wildlife tracking powered by the Tourify community. Help us protect what matters.</p>
            </div>

            <div className="search-bar">
                <Search size={20} />
                <input type="text" placeholder="Search species or location..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="loading-state"><Loader className="spin" size={32} /><p>Loading sightings...</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Bird size={48} />
                    <h3>{search ? 'No results found' : 'No sightings yet'}</h3>
                    <p>{search ? 'Try a different search term.' : 'Run the seed endpoint to populate data.'}</p>
                </div>
            ) : (
                <div className="wildlife-grid">
                    {filtered.map((w) => (
                        <div key={w._id} className="wildlife-card">
                            <div className="wildlife-indicator" style={{ background: statusColors[w.status] || '#6b7280' }}></div>
                            <div className="wildlife-body">
                                <div className="wildlife-top">
                                    <h3>{w.species}</h3>
                                    <span className={`status-badge status-${w.status.toLowerCase().replace(/\s/g, '-')}`}>
                                        {w.status}
                                    </span>
                                </div>
                                <p className="wildlife-location"><MapPin size={14} /> {w.location}</p>
                                <div className="wildlife-meta">
                                    <span><Clock size={14} /> {timeAgo(w.lastSeen)}</span>
                                    <span><Eye size={14} /> {w.sightings} sightings</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wildlife;
