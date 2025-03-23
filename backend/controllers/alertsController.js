// filepath: backend/controllers/alertsController.js
const twilioClient = require('../config/twilio');

exports.sendAlert = async (req, res) => {
    const { message, to } = req.body;

    // Validate input
    if (!to || !message) {
        return res.status(400).json({ success: false, error: "Missing recipient or message" });
    }

    if (!/^\+\d{10,15}$/.test(to)) {
        return res.status(400).json({ success: false, error: "Invalid phone number format (use E.164)" });
    }

    if (message.length > 500) {
        return res.status(400).json({ success: false, error: "Message is too long" });
    }

    try {
        const sms = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });

        res.json({ success: true, sid: sms.sid });
    } catch (error) {
        console.error("❌ SMS send error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};