// filepath: backend/models/RouteData.js
const mongoose = require('mongoose');

const RouteDataSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    data: {
        coordinates: {
            type: [[Number]], // [ [lon, lat], ... ]
            required: true
        },
        distance: {
            type: Number, // in meters
            required: true
        },
        duration: {
            type: Number, // in seconds
            required: true
        },
        summary: {
            type: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RouteData', RouteDataSchema);