const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    tag: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    price: { type: String, default: '' },
    gradient: { type: String, default: 'linear-gradient(135deg, #0a5c36, #0de381)' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Destination', DestinationSchema);
