import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Sparkles, Loader, ArrowRight, Zap, Shield, Eye, Target, ChevronRight, Calendar, MapPin, Leaf, CheckCircle, Receipt, Download, X, IndianRupee } from 'lucide-react';

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
    const [showBill, setShowBill] = useState(false);

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
        if (days < 1 || isNaN(days)) days = 3;
        if (days > 10) days = 10;

        const itinerary = [];
        const basePricePerDay = Math.floor(Math.random() * 5000 + 8000);

        for (let i = 1; i <= days; i++) {
            const currentDate = new Date(d1);
            currentDate.setDate(d1.getDate() + (i - 1));
            const dateStr = currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

            itinerary.push({
                day: i,
                date: dateStr,
                title: i === 1 ? `Arrival & Acclimatization at ${targetDestination}` :
                    i === days ? `Final Sunrise Trek & Departure` :
                        `Deep Exploration & Wildlife Tracking (Zone ${String.fromCharCode(64 + i)})`,
                desc: i === 1 ? `Arrive at the base camp eco-lodge at ${targetDestination}. Orientation on local conservation rules and a light evening walk to adjust to the climate.` :
                    i === days ? `Early morning hike to a high altitude viewpoint. Final photography session and zero-carbon transport back to the transit hub.` :
                        `A guided 4-hour trek through ancient forest corridors with a local naturalist. Expected sightings of native flora and rare endemic birds. Evening community-led stargazing.`,
                ecoImpact: `${Math.floor(Math.random() * 5 + 2)}kg CO2 Offset`,
                cost: basePricePerDay + Math.floor(Math.random() * 3000)
            });
        }
        return itneraryResult(itinerary);
    };

    const itneraryResult = (plan) => {
        const totalCost = plan.reduce((sum, day) => sum + day.cost, 0);
        return {
            steps: plan,
            totalCost: totalCost,
            tax: Math.floor(totalCost * 0.18), // 18% GST
            grandTotal: Math.floor(totalCost * 1.18)
        };
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
                const planResult = generateSimulatedPlan(formData.destination, formData.startDate, formData.endDate);
                setGeneratedPlan({
                    destination: formData.destination,
                    dates: `${formData.startDate} to ${formData.endDate}`,
                    id: response.data._id || Math.random().toString(36).substring(7),
                    itinerary: planResult.steps,
                    totalCost: planResult.totalCost,
                    tax: planResult.tax,
                    grandTotal: planResult.grandTotal
                });
                setSaved(true);
            } catch (err) {
                console.error(err);
                alert('Connection error but generating preview anyway!');
                const planResult = generateSimulatedPlan(formData.destination, formData.startDate, formData.endDate);
                setGeneratedPlan({
                    destination: formData.destination,
                    dates: `${formData.startDate} to ${formData.endDate}`,
                    id: 'preview_only',
                    itinerary: planResult.steps,
                    totalCost: planResult.totalCost,
                    tax: planResult.tax,
                    grandTotal: planResult.grandTotal
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
                                        <div className="day-info">
                                            <div className="day-number">Day {day.day}</div>
                                            <div className="day-date">{day.date}</div>
                                        </div>
                                        <div className="day-content">
                                            <h4>{day.title}</h4>
                                            <p>{day.desc}</p>
                                            <div className="day-footer">
                                                <span className="eco-tag"><Leaf size={12} /> {day.ecoImpact}</span>
                                                <span className="cost-tag"><IndianRupee size={12} /> {day.cost.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="planner-actions">
                                <button onClick={() => setShowBill(true)} className="bill-btn">
                                    <Receipt size={18} /> View Bill Summary
                                </button>
                                <button onClick={resetPlanner} className="submit-form-btn reset-btn">
                                    <Zap size={18} /> Plan Another Trip
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bill Modal */}
                {showBill && (
                    <div className="modal-overlay" onClick={() => setShowBill(false)}>
                        <div className="modal-content bill-modal" onClick={e => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setShowBill(false)}><X size={24} /></button>
                            <div className="bill-header">
                                <div className="logo-container">
                                    <div className="logo-icon"><MapPin size={20} /></div>
                                    <span className="logo-text">TOUR<span>IFY</span></span>
                                </div>
                                <div className="bill-meta">
                                    <h3>Trip Invoice</h3>
                                    <p>Date: {new Date().toLocaleDateString()}</p>
                                    <p>Invoice #: INV-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="bill-details">
                                <div className="bill-row">
                                    <span>Destination</span>
                                    <strong>{generatedPlan.destination}</strong>
                                </div>
                                <div className="bill-row">
                                    <span>Duration</span>
                                    <strong>{generatedPlan.itinerary.length} Days</strong>
                                </div>
                                <div className="bill-row">
                                    <span>Travel Dates</span>
                                    <strong>{generatedPlan.dates}</strong>
                                </div>
                            </div>

                            <div className="bill-items">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedPlan.itinerary.map((day, i) => (
                                            <tr key={i}>
                                                <td>Day {day.day}: {day.title}</td>
                                                <td className="text-right">₹{day.cost.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td>Subtotal</td>
                                            <td className="text-right">₹{generatedPlan.totalCost.toLocaleString('en-IN')}</td>
                                        </tr>
                                        <tr>
                                            <td>GST (18%)</td>
                                            <td className="text-right">₹{generatedPlan.tax.toLocaleString('en-IN')}</td>
                                        </tr>
                                        <tr className="grand-total">
                                            <td>Grand Total</td>
                                            <td className="text-right">₹{generatedPlan.grandTotal.toLocaleString('en-IN')}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="bill-footer">
                                <button className="primary-btn" onClick={() => window.print()}>
                                    <Download size={18} /> Download PDF
                                </button>
                                <p>Thank you for choosing sustainable travel with Tourify!</p>
                            </div>
                        </div>
                    </div>
                )}

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
