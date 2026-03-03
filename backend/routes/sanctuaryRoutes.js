const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const col = db.collection('sanctuaries');

router.get('/', async (req, res) => {
    try {
        const snap = await col.orderBy('createdAt', 'desc').get();
        res.json(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const ref = await col.add({ ...req.body, createdAt: new Date().toISOString() });
        const doc = await ref.get();
        res.status(201).json({ _id: doc.id, ...doc.data() });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await col.doc(req.params.id).delete();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
