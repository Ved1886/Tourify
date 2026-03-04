import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { Map, Loader, Users, MapPin, Search } from 'lucide-react';

const API = "https://tourify-hk66.onrender.com/api" || 'http://localhost:5000/api';

// Removed require() patch because Vite does not support require(). All markers use custom icons.

// Basic lookup table for fast rendering of popular destinations
const PREDEFINED_COORDS = {
    'Amazon Rainforest': [-3.4653, -62.2159],
    'Mount Fuji': [35.3606, 138.7274],
    'Banff National Park': [51.4968, -115.9281],
    'Serengeti Plains': [-2.3333, 34.8333],
    'Norwegian Fjords': [61.0333, 6.2000],
    'Galápagos Islands': [-0.6000, -90.5000],
    'Swiss Alps': [46.5606, 8.5609],
    'Great Barrier Reef': [-18.2871, 147.6992],
    'Patagonia': [-50.0000, -73.0000],
    'Jim Corbett': [29.5300, 78.7747],
    'Sundarbans': [21.9497, 89.1833]
};

// Geocoding cache
const geocodeCache = new Map();

// Helper to get coordinates
async function getCoordinates(locationName) {
    if (PREDEFINED_COORDS[locationName]) return PREDEFINED_COORDS[locationName];
    if (geocodeCache.has(locationName)) return geocodeCache.get(locationName);

    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
        if (res.data && res.data.length > 0) {
            const coords = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
            geocodeCache.set(locationName, coords);
            return coords;
        }
    } catch (err) {
        console.error("Geocoding failed for", locationName);
    }
    return null;
}

// Custom icons (initialized lazily to prevent SSR or module load crashes)
let tripIcon = null;
let destIcon = null;

const initializeIcons = () => {
    if (!L || !L.Icon) return;
    if (!tripIcon) {
        tripIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
    if (!destIcon) {
        destIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
};

export default function MapPage() {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndGeocode = async () => {
            initializeIcons();
            try {
                // Fetch trips
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

                const loadedMarkers = [];

                // Standard destinations
                for (let d of destsRes.data) {
                    const coords = await getCoordinates(d.name);
                    if (coords) {
                        loadedMarkers.push({
                            id: `dest-${d._id}`,
                            coords,
                            type: 'destination',
                            data: d
                        });
                    }
                }

                // Trips
                for (let location of Object.keys(tripGroups)) {
                    const coords = await getCoordinates(location);
                    if (coords) {
                        loadedMarkers.push({
                            id: `trips-${location}`,
                            coords: [coords[0] + (Math.random() * 0.01 - 0.005), coords[1] + (Math.random() * 0.01 - 0.005)], // Slight offset to not overlap perfectly
                            type: 'trip',
                            location,
                            count: tripGroups[location].length,
                            trips: tripGroups[location]
                        });
                    }
                    // Wait a bit to respect Nominatim limits
                    await new Promise(r => setTimeout(r, 200));
                }

                setMarkers(loadedMarkers);
            } catch (err) {
                console.error("Map data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAndGeocode();
    }, []);

    return (
        <div className="page-container" style={{ padding: '0', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ position: 'absolute', top: '100px', left: '50px', zIndex: 1000, background: 'rgba(10,15,13,0.85)', padding: '20px 30px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
                <span className="section-badge"><Map size={14} /> EXPLORER MAP</span>
                <h1 style={{ fontSize: '1.8rem' }}>Live <span className="gradient-text">Trail Map</span></h1>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>See where fellow Tourify explorers are heading around the world right now!</p>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" style={{ width: 12 }} /> Traveler Pins
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style={{ width: 12 }} /> Top Destinations
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <Loader className="spin" size={32} color="var(--accent-green)" />
                    <p>Generating world map & locating travelers...</p>
                </div>
            )}

            <div style={{ flex: 1, width: '100%', borderRadius: '0', overflow: 'hidden' }}>
                <MapContainer center={[20, 0]} zoom={3} style={{ height: '100%', width: '100%' }}>
                    {/* Dark theme tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        subdomains="abcd"
                        maxZoom={19}
                    />

                    {markers.map(m => (
                        <Marker key={m.id} position={m.coords} icon={m.type === 'trip' ? tripIcon : destIcon}>
                            <Popup>
                                <div style={{ color: '#000', padding: '5px' }}>
                                    {m.type === 'destination' ? (
                                        <>
                                            <h3 style={{ margin: '0 0 5px', fontSize: '16px', fontWeight: 'bold' }}>{m.data.name}</h3>
                                            <p style={{ margin: '0 0 5px', fontSize: '12px' }}>{m.data.country} • {m.data.tag}</p>
                                            <a href={`/planner?dest=${encodeURIComponent(m.data.name)}`} style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '12px' }}>Plan Trip →</a>
                                        </>
                                    ) : (
                                        <>
                                            <h3 style={{ margin: '0 0 5px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Users size={14} /> {m.count} Travelers
                                            </h3>
                                            <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '600' }}>📍 {m.location}</p>
                                            <div style={{ maxHeight: '100px', overflowY: 'auto', borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>
                                                {m.trips.slice(0, 3).map((t, i) => (
                                                    <div key={i} style={{ fontSize: '11px', marginBottom: '3px', padding: '3px', background: '#f3f4f6', borderRadius: '4px' }}>
                                                        <strong>{t.userName || 'Anonymous'}</strong> ({t.status})
                                                    </div>
                                                ))}
                                                {m.trips.length > 3 && <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>+ {m.trips.length - 3} more</div>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
