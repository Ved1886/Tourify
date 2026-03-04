const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const col = db.collection('newsletter');

router.post('/', async (req, res) => {
    const { email } = req.body;
    try {
        const existing = await col.where('email', '==', email).get();
        if (!existing.empty) {
            return res.status(400).json({ message: 'You are already subscribed!' });
        }
        await col.add({ email, subscribedAt: new Date().toISOString(), createdAt: new Date().toISOString() });
        res.status(201).json({ message: 'Subscribed successfully! Welcome to the Tribe.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', async (req, res) => {
    try {
        const snap = await col.orderBy('createdAt', 'desc').get();
        res.json(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete by doc ID
router.delete('/:id', async (req, res) => {
    try {
        await col.doc(req.params.id).delete();
        res.json({ message: 'Unsubscribed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
