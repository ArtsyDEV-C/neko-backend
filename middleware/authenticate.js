const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token missing or malformed." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded; // Add decoded user to request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};
