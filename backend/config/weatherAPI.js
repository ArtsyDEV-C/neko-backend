// filepath: backend/config/weatherAPI.js
const axios = require('axios');

const getWeatherData = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ OPENWEATHER_API_KEY is missing in environment variables.");
    return null;
  }

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    console.error("❌ Invalid coordinates provided.");
    return null;
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: "metric"
      }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Weather API fetch failed:", error.message);
    return null;
  }
};

module.exports = getWeatherData;