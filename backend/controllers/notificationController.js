// Filepath: backend/controllers/notificationController.js

const User = require('../models/User');
const Favorite = require('../models/Favorite');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Define keywords to trigger notification
const severeConditions = ['storm', 'rain', 'snow', 'extreme', 'thunder', 'heat', 'flood', 'tornado'];

exports.sendWeatherAlerts = async (req, res) => {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      const favorites = await Favorite.find({ userId: user._id });

      for (const fav of favorites) {
        const city = fav.city;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        const weatherDesc = data.weather[0].description.toLowerCase();

        // Check if severe condition exists
        const isSevere = severeConditions.some(cond => weatherDesc.includes(cond));

        if (isSevere) {
          const subject = `⚠️ Weather Alert for ${city}`;
          const text = `Heads up! The weather in ${city} shows signs of: ${weatherDesc}. Stay safe.`;
          const html = `
            <h2>⚠️ Weather Alert for ${city}</h2>
            <p><strong>Condition:</strong> ${weatherDesc}</p>
            <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} km/h</p>
            <hr />
            <p>This is an automated weather alert from Neko Global Weather.</p>
          `;

          await sendEmail({
            to: user.email,
            subject,
            text,
            html
          });
        }
      }
    }

    return res.status(200).json({ message: "Notifications sent (if any severe weather found)." });
  } catch (err) {
    console.error("Notification error:", err.message);
    return res.status(500).json({ error: "Failed to send alerts." });
  }
};
