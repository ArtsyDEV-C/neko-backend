const axios = require('axios');
const RouteData = require('../models/RouteData');

exports.getRoutes = async (req, res) => {
    try {
        const routes = await RouteData.find().limit(100).sort({ createdAt: -1 });
        res.json(routes);
    } catch (error) {
        console.error("Route fetch error:", error.message);
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
};

exports.getRoute = async (req, res) => {
    const { start, end } = req.body;

    // Validate input
    if (
        !Array.isArray(start) || start.length !== 2 ||
        !Array.isArray(end) || end.length !== 2 ||
        typeof start[0] !== 'number' || typeof start[1] !== 'number' ||
        typeof end[0] !== 'number' || typeof end[1] !== 'number'
    ) {
        return res.status(400).json({ error: "Start and end must be [lon, lat] arrays." });
    }

    try {
        const orsRes = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            { coordinates: [start, end] },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTESERVICE_API_KEY}`
                }
            }
        );
        res.json(orsRes.data);
    } catch (error) {
        console.error("Route API error:", error.message);
        res.status(500).json({ message: "Route fetch failed" });
    }
};