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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(passport.initialize());

app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chatbot", chatbotRoutes); // includes OpenAI + scenario endpoints
app.use("/api/alerts", alertsRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/traffic", trafficRoutes);

// Connect to MongoDB
connectDB();

// Setup HTTP + WebSocket server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

app.use('/api/user', require('./routes/userRoutes'));

// server.js or app.js

const favoriteRoutes = require('./routes/favoriteRoutes');
app.use('/api/favorites', favoriteRoutes);



io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  socket.emit("weather-alert", { msg: "⚠️ Storm warning!" });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
