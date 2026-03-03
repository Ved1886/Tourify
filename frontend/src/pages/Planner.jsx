import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader, ArrowRight, Zap, Shield, Eye, Target, ChevronRight } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

const features = [
    { icon: <Sparkles />, title: 'AI Trail Generator', desc: 'Our AI analyzes terrain, weather patterns, and biodiversity to craft your perfect nature escape with zero-carbon routing.' },
    { icon: <Shield />, title: 'Nature Guard Alerts', desc: 'Real-time alerts about endangered species, protected zones, and eco-sensitive areas along your trail.' },
    { icon: <Eye />, title: 'Wildlife Spotting', desc: 'Live wildlife sighting reports from the Tourify Tribe. Know exactly where to spot rare birds, mammals, and marine life.' },
    { icon: <Target />, title: 'Sanctuary Finder', desc: 'Discover hidden sanctuaries, secret waterfalls, and untouched forests off the beaten path using AI.' }
];

function Planner() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [formData, setFormData] = useState({
        destination: '', startDate: '', endDate: '', notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(async () => {
            try {
                await axios.post(`${API}/trips`, formData);
                setFormData({ destination: '', startDate: '', endDate: '', notes: '' });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err) {
                alert('Failed to save. Make sure MongoDB & backend are running.');
            } finally { setLoading(false); }
        }, 1500);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Zap size={14} /> AI PLANNER</span>
                <h1>Plan Your <span className="gradient-text">Perfect Trail</span></h1>
                <p>Tell our AI where you want to escape. It will generate a sustainable itinerary and save it to your log.</p>
            </div>

            <div className="planner-layout">
                {/* Form Side */}
                <div className="planner-form-container">
                    {saved && (
                        <div className="success-banner">
                            <Sparkles size={18} /> Trail saved to your Sanctuary Log!
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="planner-form page-form">
                        <div className="form-group">
                            <label>Destination / Sanctuary</label>
                            <input type="text" required placeholder="e.g. Amazon Rainforest, Banff National Park"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Arrival Date</label>
                                <input type="date" required value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Departure Date</label>
                                <input type="date" required value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Vibe / Wildlife Preferences</label>
                            <textarea placeholder="I want to see waterfalls, native birds, minimal crowds..." rows="4"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>
                        </div>
                        <button type="submit" className="submit-form-btn" disabled={loading}>
                            {loading ? <><Loader className="spin" size={20} /> Generating AI Trail...</> : <><Sparkles size={18} /> Generate & Save Trail</>}
                        </button>
                    </form>
                </div>

                {/* Features Side */}
                <div className="features-tabs">
                    {features.map((f, i) => (
                        <div key={i} className={`feature-tab ${activeFeature === i ? 'active' : ''}`}
                            onClick={() => setActiveFeature(i)}>
                            <div className="feature-tab-icon">{f.icon}</div>
                            <div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                            <ChevronRight className="feature-arrow" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Planner;
