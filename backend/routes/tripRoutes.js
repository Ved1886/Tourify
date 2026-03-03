const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const col = db.collection('trips');

router.get('/', async (req, res) => {
  try {
    const snap = await col.orderBy('createdAt', 'desc').get();
    const data = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await col.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Trip not found' });
    res.json({ _id: doc.id, ...doc.data() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const docRef = await col.add({ ...req.body, createdAt: new Date().toISOString() });
    const doc = await docRef.get();
    res.status(201).json({ _id: doc.id, ...doc.data() });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    await col.doc(req.params.id).update(req.body);
    const doc = await col.doc(req.params.id).get();
    res.json({ _id: doc.id, ...doc.data() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await col.doc(req.params.id).delete();
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
