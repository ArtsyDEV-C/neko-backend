// filepath: backend/controllers/businessController.js
const BusinessData = require('../models/BusinessData');

exports.getBusinessData = async (req, res) => {
    try {
        const data = await BusinessData.find().limit(100); // Add limit for performance
        res.json(data);
    } catch (error) {
        console.error("❌ Business data fetch error:", error.message);
        res.status(500).json({ error: 'Failed to fetch business data' });
    }
};