const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    level: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
