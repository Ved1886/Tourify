import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, Leaf, AlertCircle } from 'lucide-react';

function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Leaf size={24} />
                    </div>
                    <h1>Join Tourify</h1>
                    <p>Create your account and start exploring</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Full Name</label>
                        <div className="auth-input-wrapper">
                            <User size={18} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <Lock size={18} />
                            <input
                                type="password"
                                placeholder="Min 6 characters"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <Lock size={18} />
                            <input
                                type="password"
                                placeholder="Repeat your password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
