const mongoose = require('mongoose');

const WildlifeSchema = new mongoose.Schema({
    species: {
        type: String,
        required: [true, 'Species name is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    status: {
        type: String,
        enum: ['Endangered', 'Critically Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern'],
        default: 'Least Concern'
    },
    sightings: {
        type: Number,
        default: 0
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Wildlife', WildlifeSchema);
