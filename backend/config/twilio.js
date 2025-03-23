// filepath: backend/config/twilio.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn("⚠️ TWILIO_SID or TWILIO_AUTH_TOKEN is missing in environment variables.");
}

const client = new twilio(accountSid, authToken);

module.exports = client;