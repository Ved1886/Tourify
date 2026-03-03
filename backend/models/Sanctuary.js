const mongoose = require('mongoose');

const SanctuarySchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, default: '' },
    visitors: { type: String, default: '' },
    difficulty: { type: String, default: 'Moderate' },
    description: { type: String, default: '' },
    gradient: { type: String, default: 'linear-gradient(135deg, #065f46, #34d399)' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sanctuary', SanctuarySchema);
