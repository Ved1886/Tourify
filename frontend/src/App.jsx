import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
    Leaf, Map, Shield, Globe, Users, Bird, FileText,
    Compass, LogOut, User, Loader, Menu, X
} from 'lucide-react';
import './index.css';

import Home from './pages/Home.jsx';
import Planner from './pages/Planner.jsx';
import Trails from './pages/Trails.jsx';
import NatureGuard from './pages/NatureGuard.jsx';
import Sanctuary from './pages/Sanctuary.jsx';
import Tribe from './pages/Tribe.jsx';
import Wildlife from './pages/Wildlife.jsx';
import Log from './pages/Log.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Chatbot from './pages/Chatbot.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-state"><Loader className="spin" size={32} /><p>Loading...</p></div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
}

function App() {
    const location = useLocation();
    const { user, logout, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const isDashboard = location.pathname === '/dashboard' || location.pathname === '/admin';

    const closeMenu = () => setMenuOpen(false);

    if (loading) {
        return (
            <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader className="spin" size={32} style={{ color: '#0de381' }} />
            </div>
        );
    }

    return (
        <div className="app-container">
            {!isDashboard && (
                <nav className="navbar">
                    <Link to="/" className="logo-container" style={{ textDecoration: 'none', color: 'inherit' }} onClick={closeMenu}>
                        <div className="logo-icon"><Leaf size={20} strokeWidth={2.5} /></div>
                        <div className="logo-text">Tourify<span>.ai</span></div>
                    </Link>

                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        <Link to="/planner" className={`nav-item ${location.pathname === '/planner' ? 'active' : ''}`} onClick={closeMenu}>
                            <Compass /> AI Planner
                        </Link>
                        <Link to="/trails" className={`nav-item ${location.pathname === '/trails' ? 'active' : ''}`} onClick={closeMenu}>
                            <Map /> Trails
                        </Link>
                        <Link to="/nature-guard" className={`nav-item ${location.pathname === '/nature-guard' ? 'active' : ''}`} onClick={closeMenu}>
                            <Shield /> Nature Guard
                        </Link>
                        <Link to="/sanctuary" className={`nav-item ${location.pathname === '/sanctuary' ? 'active' : ''}`} onClick={closeMenu}>
                            <Globe /> Sanctuary
                        </Link>
                        <Link to="/tribe" className={`nav-item ${location.pathname === '/tribe' ? 'active' : ''}`} onClick={closeMenu}>
                            <Users /> Tribe
                        </Link>
                        <Link to="/wildlife" className={`nav-item ${location.pathname === '/wildlife' ? 'active' : ''}`} onClick={closeMenu}>
                            <Bird /> Wildlife
                        </Link>
                        <Link to="/log" className={`nav-item ${location.pathname === '/log' ? 'active' : ''}`} onClick={closeMenu}>
                            <FileText /> Log
                        </Link>

                        {/* Mobile-only auth links */}
                        <div className="mobile-auth-links">
                            {user ? (
                                <>
                                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-item" onClick={closeMenu}>
                                        <User /> {user.name?.split(' ')[0]}
                                    </Link>
                                    <button className="nav-item" onClick={() => { logout(); closeMenu(); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <LogOut /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="nav-item" onClick={closeMenu}>Sign In</Link>
                                    <Link to="/signup" className="nav-item signup-mobile" onClick={closeMenu}>Join Now</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Overlay for mobile */}
                    {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

                    <div className="auth-actions">
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-user-btn">
                                    <User size={16} /> {user.name?.split(' ')[0]}
                                </Link>
                                <button className="sign-in-btn" onClick={logout}>
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="sign-in-btn-link">Sign In</Link>
                                <Link to="/signup" className="join-now-btn" style={{ textDecoration: 'none' }}>Join Now</Link>
                            </>
                        )}
                    </div>
                </nav>
            )}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/trails" element={<Trails />} />
                <Route path="/nature-guard" element={<NatureGuard />} />
                <Route path="/sanctuary" element={<Sanctuary />} />
                <Route path="/tribe" element={<Tribe />} />
                <Route path="/wildlife" element={<Wildlife />} />
                <Route path="/log" element={<Log />} />
                <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Routes>

            {!isDashboard && location.pathname !== '/login' && location.pathname !== '/signup' && (
                <footer className="footer">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="logo-container">
                                <div className="logo-icon"><Leaf size={20} strokeWidth={2.5} /></div>
                                <div className="logo-text">Tourify<span>.ai</span></div>
                            </div>
                            <p>Nature-first travel, powered by artificial intelligence. Reconnect with Earth, sustainably.</p>
                        </div>
                        <div className="footer-links">
                            <h4>Explore</h4>
                            <Link to="/planner">AI Planner</Link>
                            <Link to="/trails">Trails</Link>
                            <Link to="/sanctuary">Sanctuaries</Link>
                            <Link to="/log">Trail Log</Link>
                        </div>
                        <div className="footer-links">
                            <h4>Community</h4>
                            <Link to="/tribe">Tribe</Link>
                            <Link to="/wildlife">Wildlife</Link>
                            <Link to="/nature-guard">Nature Guard</Link>
                        </div>
                        <div className="footer-links">
                            <h4>Account</h4>
                            <Link to="/login">Sign In</Link>
                            <Link to="/signup">Create Account</Link>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Tourify.ai — Built with 🌱 for the planet</p>
                    </div>
                </footer>
            )}
            <Chatbot />
        </div>
    );
}

export default App;
