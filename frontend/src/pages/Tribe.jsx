import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Star, Award, Send, Mail, Loader } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Tribe() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API}/testimonials`);
                setMembers(res.data);
            } catch (err) { console.log(err.message); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleNewsletter = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/newsletter`, { email: newsletterEmail });
            setNewsletterEmail('');
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Subscription failed.');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Users size={14} /> THE TRIBE</span>
                <h1>Join the <span className="gradient-text">Community</span></h1>
                <p>Nature lovers sharing trails, wildlife sightings, and conservation efforts worldwide.</p>
            </div>

            {loading ? (
                <div className="loading-state"><Loader className="spin" size={32} /><p>Loading community...</p></div>
            ) : members.length === 0 ? (
                <div className="empty-state">
                    <Users size={48} />
                    <h3>No community members yet</h3>
                    <p>Run the seed endpoint to populate data.</p>
                </div>
            ) : (
                <div className="tribe-grid">
                    {members.map((m) => (
                        <div key={m._id} className="tribe-card">
                            <div className="tribe-avatar">{m.name[0]}</div>
                            <h3>{m.name}</h3>
                            <p className="tribe-role">{m.role}</p>
                            <div className="tribe-stars">
                                {[...Array(m.rating)].map((_, j) => (
                                    <Star key={j} size={14} fill="#f59e0b" stroke="#f59e0b" />
                                ))}
                            </div>
                            <p className="tribe-bio">"{m.text}"</p>
                            <div className="tribe-stat">
                                <Award size={14} /> {m.trips} trails completed
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Newsletter */}
            <div className="tribe-newsletter">
                <h2>Join the <span className="gradient-text">Tourify Tribe</span></h2>
                <p>Get weekly AI-curated trail recommendations and wildlife updates.</p>
                {subscribed && <div className="success-banner"><Award size={18} /> Welcome to the Tribe!</div>}
                <form onSubmit={handleNewsletter} className="newsletter-form">
                    <div className="newsletter-input-wrapper">
                        <Mail size={18} />
                        <input type="email" required placeholder="Enter your email address"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="primary-btn"><Send size={16} /> Subscribe</button>
                </form>
            </div>
        </div>
    );
}

export default Tribe;
