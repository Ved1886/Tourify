const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, default: '' },
    text: { type: String, required: true },
    rating: { type: Number, default: 5 },
    trips: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
