const axios = require('axios');

exports.getTrafficData = async (req, res) => {
    const { lat, lon, zoom = 10 } = req.query;

    // Validate input
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ message: "Invalid or missing coordinates" });
    }

    try {
        const response = await axios.get(
            `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/${zoom}/json`,
            {
                params: {
                    point: `${lat},${lon}`,
                    key: process.env.TOMTOM_API_KEY
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Traffic API error:", error.message);
        res.status(500).json({ message: "Failed to fetch traffic data" });
    }
};