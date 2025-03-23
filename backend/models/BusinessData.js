// filepath: backend/models/BusinessData.js
const mongoose = require('mongoose');

const BusinessDataSchema = new mongoose.Schema({
    industry: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    source: {
        type: String
    },
    region: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BusinessData', BusinessDataSchema);