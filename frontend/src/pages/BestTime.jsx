import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Loader, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

export default function BestTime() {
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!destination.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const prompt = `You are a nature travel seasons expert.
Analyze the best time to visit: "${destination}".
Return ONLY a valid, minified JSON array in this exact format, with EXACTLY 12 objects (one for each month starting January). No markdown formatting, no backticks, just the raw JSON array.
Format:
[{"month":"January", "status": "Best"|"Good"|"Avoid", "reason": "Short reason about weather/wildlife"}]`;

            const res = await axios.post(`${API}/chat`, {
                messages: [{ role: 'user', content: prompt }]
            });

            const reply = res.data.reply;
            // Try to extract JSON if it was wrapped in markdown
            const jsonMatch = reply.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Invalid response format from AI");

            const parsed = JSON.parse(jsonMatch[0]);
            if (!Array.isArray(parsed) || parsed.length !== 12) {
                throw new Error("Invalid month data");
            }
            setResult({ destination, months: parsed });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "The AI might be overloaded. Please try again.";
            setError(`Prediction Failed: ${msg}`);
        }
        finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status.toLowerCase().includes('best')) return 'var(--accent-green)';
        if (status.toLowerCase().includes('good')) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusIcon = (status) => {
        if (status.toLowerCase().includes('best')) return <CheckCircle2 size={16} />;
        if (status.toLowerCase().includes('good')) return <Sparkles size={16} />;
        return <AlertTriangle size={16} />;
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
                <span className="section-badge" style={{ margin: '0 auto 1rem' }}><Calendar size={14} /> AI Predictor</span>
                <h1>Best Time to <span className="gradient-text">Visit</span></h1>
                <p>Enter any nature destination on Earth, and our AI season engine will tell you exactly when to go for perfect weather and wildlife.</p>
            </div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <form onSubmit={handlePredict} className="predictor-form" style={{ display: 'flex', gap: '10px', background: 'var(--card-bg)', padding: '10px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1, padding: '0 15px' }}>
                        <MapPin size={20} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="e.g. Jim Corbett, Amazon, Mount Fuji..."
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '15px 10px', outline: 'none', fontSize: '1rem' }}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: '12px', padding: '0 25px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? <Loader className="spin" size={20} /> : 'Predict'}
                    </button>
                </form>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '15px', borderRadius: '12px', color: '#ef4444', textAlign: 'center', marginBottom: '2rem' }}>
                        {error}
                    </div>
                )}

                {loading && !result && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
                            <div className="spin" style={{ position: 'absolute', inset: 0, border: '4px solid rgba(13,227,129,0.2)', borderTopColor: 'var(--accent-green)', borderRadius: '50%' }}></div>
                            <Calendar size={30} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--accent-green)' }} />
                        </div>
                        <h3>Analyzing historical season data...</h3>
                        <p>Checking weather patterns and wildlife migrations</p>
                    </div>
                )}

                {result && (
                    <div className="predictor-result" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', animation: 'fade-in 0.5s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{result.destination}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>12-Month Season Forecast</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {result.months.map((m, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid',
                                    borderColor: m.status.toLowerCase().includes('best') ? 'rgba(13,227,129,0.3)' : (m.status.toLowerCase().includes('good') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'),
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: getStatusColor(m.status) }}></div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', color: getStatusColor(m.status) }}>
                                        {m.month}
                                    </h3>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.75rem', color: getStatusColor(m.status) }}>
                                        {getStatusIcon(m.status)} {m.status}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{m.reason}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2.5rem', textAlign: 'center', padding: '1.5rem', background: 'rgba(13,227,129,0.05)', borderRadius: '16px', border: '1px solid rgba(13,227,129,0.2)' }}>
                            <h3 style={{ marginBottom: '10px' }}>Ready to go?</h3>
                            <button onClick={() => window.location.href = `/planner?dest=${encodeURIComponent(result.destination)}`} style={{ background: 'var(--accent-green)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Plan Itinerary <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
