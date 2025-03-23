require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/db");
const passport = require('./config/passport');
const http = require('http');
const socketIo = require('socket.io');

// Import Routes
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const alertsRoutes = require("./routes/alertsRoutes");
const businessRoutes = require("./routes/businessRoutes");
const routeRoutes = require("./routes/routeRoutes");
const voiceRoutes = require('./routes/voiceRoutes');
const trafficRoutes = require('./routes/trafficRoutes');

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());  // Parses JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests
app.use(cors());  // Handles Cross-Origin Requests
app.use(morgan("dev"));  // Logs requests
app.use(helmet());  // Security headers
app.use(passport.initialize()); // Initialize passport

// Example of a correct middleware function
app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/traffic", trafficRoutes); // Add this line

// Connect to MongoDB
connectDB(); // Use the new MongoDB connection function

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("weather-alert", { msg: "Storm warning!" });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
