import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { ConnectDB } from "./src/lib/db.js";

import alertRoutes from "./src/routes/alerts.js";
import locationRoutes from "./src/routes/locations.js";
import userRoutes from "./src/routes/users.js";
import linkTokenRoutes from "./src/routes/linkTokens.js";
import parentChildRoutes from "./src/routes/parentChild.js";
import pushTokenRoutes from "./src/routes/pushTokens.js";
import conversationRoutes from "./src/routes/conversations.js"
import messageRoutes from "./src/routes/messages.js";
import authRoutes from "./src/routes/authTokens.js"

import { initSockets } from "./src/sockets/socketHandler.js";

// create Express instance
const app = express();

// Enable JSON reading
app.use(express.json());
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Create http server
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// make io accessible everywhere
app.set("io", io);

// Set up routes
app.use("/api/alerts", alertRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/linkTokens", linkTokenRoutes);
app.use("/api/parentChildren", parentChildRoutes);
app.use("/api/pushTokens", pushTokenRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/authTokens", authRoutes);

// Socket logic
initSockets(io);

// Connect to MySQL database
await ConnectDB();

// Import cron job
import "./src/cron/retrainModels.js"

// Grab port
const PORT = process.env.PORT || 5001

// Start server
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
})