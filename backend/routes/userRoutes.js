const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const auth = require('../middleware/auth');
const router = express.Router();

const usersRef = db.collection('users');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await usersRef.where('email', '==', email).get();
        if (!existing.empty) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const docRef = await usersRef.add({
            name, email, password: hashedPassword, role: 'user', createdAt: new Date().toISOString()
        });

        const token = jwt.sign(
            { id: docRef.id, email, role: 'user' },
            process.env.JWT_SECRET || 'tourify_super_secret_key_2026',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: { id: docRef.id, name, email, role: 'user' }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const snapshot = await usersRef.where('email', '==', email).get();
        if (snapshot.empty) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: userDoc.id, email: userData.email, role: userData.role },
            process.env.JWT_SECRET || 'tourify_super_secret_key_2026',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: userDoc.id, name: userData.name, email: userData.email, role: userData.role }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get profile
router.get('/me', auth, async (req, res) => {
    try {
        const doc = await usersRef.doc(req.user.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'User not found.' });
        const data = doc.data();
        res.json({ _id: doc.id, name: data.name, email: data.email, role: data.role });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update profile
router.put('/me', auth, async (req, res) => {
    const { name } = req.body;
    try {
        await usersRef.doc(req.user.id).update({ name });
        const doc = await usersRef.doc(req.user.id).get();
        const data = doc.data();
        res.json({ _id: doc.id, name: data.name, email: data.email, role: data.role });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Register admin
router.post('/register-admin', async (req, res) => {
    const { name, email, password, adminSecret } = req.body;
    try {
        if (adminSecret !== (process.env.ADMIN_SECRET || 'tourify_admin_2026')) {
            return res.status(403).json({ message: 'Invalid admin secret key.' });
        }

        const existing = await usersRef.where('email', '==', email).get();
        if (!existing.empty) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const docRef = await usersRef.add({
            name, email, password: hashedPassword, role: 'admin', createdAt: new Date().toISOString()
        });

        const token = jwt.sign(
            { id: docRef.id, email, role: 'admin' },
            process.env.JWT_SECRET || 'tourify_super_secret_key_2026',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Admin registered successfully!',
            token,
            user: { id: docRef.id, name, email, role: 'admin' }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
