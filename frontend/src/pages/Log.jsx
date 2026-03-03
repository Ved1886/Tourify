import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, TreePine, Calendar, X, Loader } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

function Log() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchTrips(); }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/trips`);
            setTrips(res.data);
        } catch (err) {
            console.log('Unable to fetch trips:', err.message);
        } finally { setLoading(false); }
    };

    const deleteTrip = async (id) => {
        try {
            await axios.delete(`${API}/trips/${id}`);
            await fetchTrips();
        } catch (err) {
            alert('Failed to delete trip.');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <span className="section-badge"><FileText size={14} /> SANCTUARY LOG</span>
                <h1>Your Saved <span className="gradient-text">Trails</span></h1>
                <p>All your AI-generated trails stored in MongoDB. Your personal earth-log.</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader className="spin" size={32} />
                    <p>Connecting to MongoDB...</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="empty-state">
                    <TreePine size={48} />
                    <h3>No trails saved yet</h3>
                    <p>Head to the AI Planner to generate your first trail!</p>
                </div>
            ) : (
                <div className="trips-grid">
                    {trips.map(trip => (
                        <div key={trip._id} className="trip-card">
                            <div className="trip-card-header">
                                <h3><TreePine size={18} /> {trip.destination}</h3>
                                <button className="delete-trip" onClick={() => deleteTrip(trip._id)}>
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="trip-dates">
                                <Calendar size={14} /> {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                            </p>
                            <p className="trip-notes">{trip.notes || 'An AI curated adventure into the wild.'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Log;
