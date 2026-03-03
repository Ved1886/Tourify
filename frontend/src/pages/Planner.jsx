import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Sparkles, Loader, ArrowRight, Zap, Shield, Eye, Target, ChevronRight, Calendar, MapPin, Leaf, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const features = [
    { icon: <Sparkles />, title: 'AI Trail Generator', desc: 'Our AI analyzes terrain, weather patterns, and biodiversity to craft your perfect nature escape with zero-carbon routing.' },
    { icon: <Shield />, title: 'Nature Guard Alerts', desc: 'Real-time alerts about endangered species, protected zones, and eco-sensitive areas along your trail.' },
    { icon: <Eye />, title: 'Wildlife Spotting', desc: 'Live wildlife sighting reports from the Tourify Tribe. Know exactly where to spot rare birds, mammals, and marine life.' },
    { icon: <Target />, title: 'Sanctuary Finder', desc: 'Discover hidden sanctuaries, secret waterfalls, and untouched forests off the beaten path using AI.' }
];

function Planner() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [saved, setSaved] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [formData, setFormData] = useState({
        destination: '', startDate: '', endDate: '', notes: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dest = params.get('dest');
        if (dest) {
            setFormData(prev => ({ ...prev, destination: dest }));
        }
    }, [location]);

    const loadingText = [
        "Analyzing terrain and topography...",
        "Checking local wildlife migration patterns...",
        "Evaluating eco-friendly lodging options...",
        "Calculating zero-carbon routing...",
        "Finalizing your Sanctuary itinerary..."
    ];

    const generateSimulatedPlan = (targetDestination, start, end) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        if (days < 1 || isNaN(days)) days = 3; // Default to 3 days if invalid
        if (days > 7) days = 7; // Cap at 7 for simulation

        const itinerary = [];
        for (let i = 1; i <= days; i++) {
            itinerary.push({
                day: i,
                title: i === 1 ? `Arrival & Acclimatization at ${targetDestination}` :
                    i === days ? `Final Sunrise Trek & Departure` :
                        `Deep Exploration & Wildlife Tracking (Zone ${String.fromCharCode(64 + i)})`,
                desc: i === 1 ? `Arrive at the base camp eco-lodge. Orientation on local conservation rules and a light evening walk to adjust to the climate.` :
                    i === days ? `Early morning hike to a high altitude viewpoint. Final photography session and zero-carbon transport back to the transit hub.` :
                        `A guided 4-hour trek through ancient forest corridors with a local naturalist. Expected sightings of native flora and rare endemic birds. Evening community-led stargazing.`,
                ecoImpact: `${Math.floor(Math.random() * 5 + 2)}kg CO2 Offset`
            });
        }
        return itinerary;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        setGeneratedPlan(null);
        setLoadingStep(0);

        // Simulate AI thinking steps
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < 5) {
                setLoadingStep(step);
            } else {
                clearInterval(interval);
            }
        }, 800);

        // Allow 'thinking' to complete before showing result
        setTimeout(async () => {
            try {
                // Save to Backend automatically
                const response = await axios.post(`${API}/trips`, formData);

                // Generate and show plan
                const plan = generateSimulatedPlan(formData.destination, formData.startDate, formData.endDate);
                setGeneratedPlan({
                    destination: formData.destination,
                    dates: `${formData.startDate} to ${formData.endDate}`,
                    id: response.data._id || Math.random().toString(36).substring(7),
                    itinerary: plan
                });
                setSaved(true);
            } catch (err) {
                console.error(err);
                alert('Connection error but generating preview anyway!');
                // Generate plan anyway if backend fails for demo purposes
                const plan = generateSimulatedPlan(formData.destination, formData.startDate, formData.endDate);
                setGeneratedPlan({
                    destination: formData.destination,
                    dates: `${formData.startDate} to ${formData.endDate}`,
                    id: 'preview_only',
                    itinerary: plan
                });
            } finally {
                setLoading(false);
            }
        }, 4500);
    };

    const resetPlanner = () => {
        setGeneratedPlan(null);
        setFormData({ destination: '', startDate: '', endDate: '', notes: '' });
        setSaved(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><Zap size={14} /> AI PLANNER</span>
                <h1>Plan Your <span className="gradient-text">Perfect Trail</span></h1>
                <p>Tell our AI where you want to escape. It will generate a sustainable itinerary and save it to your log.</p>
            </div>

            <div className="planner-layout">
                {/* Form / Output Side */}
                <div className="planner-form-container">
                    {!generatedPlan ? (
                        <>
                            {loading ? (
                                <div className="ai-loading-state">
                                    <div className="ai-spinner-container">
                                        <Loader className="spin ai-spinner" size={40} />
                                    </div>
                                    <h3 className="gradient-text">AI is working...</h3>
                                    <p className="loading-step-text">{loadingText[loadingStep]}</p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${(loadingStep + 1) * 20}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="planner-form page-form">
                                    <div className="form-group">
                                        <label>Destination / Sanctuary</label>
                                        <input type="text" required placeholder="e.g. Amazon Rainforest, Banff..."
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
                                    <button type="submit" className="submit-form-btn">
                                        <Sparkles size={18} /> Generate AI Itinerary
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="ai-output-container">
                            <div className="ai-output-header">
                                <div>
                                    <h2 className="gradient-text">{generatedPlan.destination}</h2>
                                    <p className="dates-label"><Calendar size={14} /> {generatedPlan.dates}</p>
                                </div>
                                {saved && <span className="saved-badge"><CheckCircle size={14} /> Saved to Log</span>}
                            </div>

                            <div className="ai-itinerary">
                                {generatedPlan.itinerary.map((day, idx) => (
                                    <div key={idx} className="itinerary-day">
                                        <div className="day-number">Day {day.day}</div>
                                        <div className="day-content">
                                            <h4>{day.title}</h4>
                                            <p>{day.desc}</p>
                                            <span className="eco-tag"><Leaf size={12} /> {day.ecoImpact}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={resetPlanner} className="submit-form-btn reset-btn">
                                <Zap size={18} /> Plan Another Trip
                            </button>
                        </div>
                    )}
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
