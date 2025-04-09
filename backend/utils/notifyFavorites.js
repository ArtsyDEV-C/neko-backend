// utils/notifyFavorites.js
const Favorite = require('../models/Favorite');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await axios.get(url);
  const w = res.data;
  return `🌤️ ${w.name}: ${w.main.temp}°C, ${w.weather[0].description}`;
}

exports.notifyFavoritesWeather = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const favorites = await Favorite.find({ user: user._id });
      if (!favorites.length || !user.email) continue;

      let weatherSummaries = [];
      for (const fav of favorites) {
        try {
          const summary = await getWeather(fav.city);
          weatherSummaries.push(summary);
        } catch (err) {
          weatherSummaries.push(`⚠️ ${fav.city}: Weather unavailable`);
        }
      }

      const emailContent = weatherSummaries.join('\n');
      const msg = {
        to: user.email,
        from: process.env.SENDGRID_EMAIL,
        subject: `⛅ Your Daily Weather Summary – ${new Date().toLocaleDateString()}`,
        text: emailContent,
      };

      await sgMail.send(msg);
      console.log(`✅ Email sent to ${user.email}`);
    }
  } catch (err) {
    console.error("❌ Error sending weather emails:", err.message);
  }
};
