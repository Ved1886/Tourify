const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const col = db.collection('contacts');

router.post('/', async (req, res) => {
    try {
        await col.add({ ...req.body, status: 'unread', createdAt: new Date().toISOString() });
        res.status(201).json({ message: "Message sent successfully! We'll get back to you soon." });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', async (req, res) => {
    try {
        const snap = await col.orderBy('createdAt', 'desc').get();
        res.json(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/read', async (req, res) => {
    try {
        await col.doc(req.params.id).update({ status: 'read' });
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await col.doc(req.params.id).delete();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
