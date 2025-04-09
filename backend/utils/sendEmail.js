// Filepath: backend/utils/sendEmail.js

const sgMail = require('@sendgrid/mail');

// Load API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML content
 */
async function sendEmail({ to, subject, text, html }) {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL, // Your verified sender
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.response?.body || error.message);
  }
}

module.exports = sendEmail;
