import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sprout } from 'lucide-react';

function Home() {
    return (
        <section className="hero">
            <div className="hero-glow"></div>
            <div className="badge"><Sprout /> NATURE-INSPIRED JOURNEY</div>

            <h1>
                Reconnect<br />
                <span className="gradient-text">With Earth</span>
            </h1>

            <p className="hero-subtitle">
                Let AI breathe life into your next escape. Discover hidden sanctuaries where
                silence speaks louder than words and nature is your compass.
            </p>

            <div className="action-buttons">
                <Link to="/planner" className="primary-btn">
                    Start Planning <ArrowRight size={20} />
                </Link>
                <Link to="/trails" className="secondary-btn">
                    <Compass size={20} /> View Trails
                </Link>
            </div>

            <div className="hero-trust">
                <div className="trust-avatars">
                    <div className="avatar" style={{ background: '#0de381' }}>S</div>
                    <div className="avatar" style={{ background: '#6366f1' }}>M</div>
                    <div className="avatar" style={{ background: '#f59e0b' }}>A</div>
                    <div className="avatar" style={{ background: '#22d3ee' }}>K</div>
                </div>
                <p><strong>89,000+</strong> nature lovers already exploring</p>
            </div>
        </section>
    );
}

export default Home;
