import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bird, MapPin, Clock, Eye, Search, Loader, Plus, X, Sparkles } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

const statusColors = {
    'Endangered': '#f59e0b',
    'Critically Endangered': '#dc2626',
    'Vulnerable': '#8b5cf6',
    'Near Threatened': '#10b981',
    'Least Concern': '#6b7280'
};

function timeAgo(date) {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    if (isNaN(diff)) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function Wildlife() {
    const [wildlife, setWildlife] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [form, setForm] = useState({ species: '', location: '', status: 'Least Concern' });
    const [submitting, setSubmitting] = useState(false);
    const [aiFact, setAiFact] = useState('');

    const fetchWildlife = async () => {
        try {
            const res = await axios.get(`${API}/wildlife`);
            setWildlife(res.data);
        } catch (err) { console.log(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchWildlife(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setAiFact('');
        try {
            // Predict a fun fact simultaneously
            const prompt = `Give me a single, short, mind-blowing fun fact about the animal "${form.species}". Max 20 words.`;
            const factPromise = axios.post(`${API}/chat`, { messages: [{ role: 'user', content: prompt }] });

            // Save to database
            const payload = {
                ...form,
                sightings: 1,
                lastSeen: new Date().toISOString()
            };
            const postPromise = axios.post(`${API}/wildlife`, payload);

            const [factRes, postRes] = await Promise.all([factPromise, postPromise].map(p => p.catch(e => e)));

            if (factRes && factRes.data) {
                setAiFact(factRes.data.reply);
            } else {
                setAiFact("Thanks for contributing to citizen science!");
            }

            // Wait a sec for user to read fact
            await fetchWildlife();
            setShowModal(false);
            setForm({ species: '', location: '', status: 'Least Concern' });
            setAiFact('');
            setSubmitting(false);


        } catch (err) {
            console.error(err);
            setSubmitting(false);
        }
    };

    const filtered = wildlife.filter(w =>
        (w.species || '').toLowerCase().includes(search.toLowerCase()) ||
        (w.location || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <span className="section-badge"><Bird size={14} /> WILDLIFE TRACKER</span>
                    <h1>Real-Time <span className="gradient-text">Sightings</span></h1>
                    <p>Live wildlife tracking powered by the Tourify community. Help us protect what matters.</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent-green)', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
                    <Plus size={18} /> Report Sighting
                </button>
            </div>

            <div className="search-bar" style={{ marginBottom: '2rem' }}>
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
                    <p>{search ? 'Try a different search term.' : 'Be the first to report a wildlife sighting!'}</p>
                </div>
            ) : (
                <div className="wildlife-grid">
                    {filtered.map((w) => (
                        <div key={w._id} className="wildlife-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="wildlife-indicator" style={{ background: statusColors[w.status] || '#6b7280' }}></div>
                            <div className="wildlife-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="wildlife-top">
                                    <h3>{w.species}</h3>
                                    <span className={`status-badge status-${(w.status || '').toLowerCase().replace(/\s/g, '-')}`}>
                                        {w.status}
                                    </span>
                                </div>
                                <p className="wildlife-location" style={{ flex: 1 }}><MapPin size={14} /> {w.location}</p>
                                <div className="wildlife-meta" style={{ marginTop: 'auto' }}>
                                    <span><Clock size={14} /> {timeAgo(w.lastSeen)}</span>
                                    <span><Eye size={14} /> {w.sightings} sightings</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sighting Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
                        <button className="close-btn" onClick={() => setShowModal(false)} disabled={submitting}>
                            <X size={20} />
                        </button>
                        <h2>Report Sighting</h2>

                        {!aiFact ? (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Species Name</label>
                                    <input type="text" required value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} placeholder="e.g. Bengal Tiger" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Location Spotted</label>
                                    <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Jim Corbett, India" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Conservation Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}>
                                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <button type="submit" disabled={submitting} style={{ background: 'var(--accent-green)', color: '#000', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', marginTop: '10px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                    {submitting ? <Loader className="spin" size={20} style={{ margin: '0 auto' }} /> : 'Submit Report'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px 10px', animation: 'fade-in 0.5s ease' }}>
                                <div style={{ background: 'rgba(13,227,129,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent-green)' }}>
                                    <Sparkles size={30} />
                                </div>
                                <h3 style={{ marginBottom: '15px' }}>Report Saved!</h3>
                                <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: '#fff' }}>Did you know?</strong><br />
                                    "{aiFact}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
