
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token missing or malformed." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add decoded user to request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

function optional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // Allow unauthenticated access
  }

  authenticate(req, res, next);
}

module.exports = {
  protect: authenticate,
  optional,
};
