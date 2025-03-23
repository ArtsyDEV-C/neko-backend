const axios = require('axios');

const getTrafficData = async (location) => {
  const apiKey = process.env.TRAFFIC_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ TRAFFIC_API_KEY is missing in .env");
    return null;
  }

  try {
    const response = await axios.get(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`, {
      params: {
        key: apiKey,
        point: location, // e.g., "12.9716,77.5946"
      }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch traffic data:", error.message);
    return null;
  }
};

module.exports = getTrafficData;