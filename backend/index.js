import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { ConnectDB } from "./src/lib/db.js";

import alertRoutes from "./src/routes/alerts.js";
import commuteRoutes from "./src/routes/commutes.js";
import locationRoutes from "./src/routes/locations.js";
import safeZoneRoutes from "./src/routes/safeZones.js";
import userRoutes from "./src/routes/users.js";
import linkTokenRoutes from "./src/routes/linkTokens.js";
import parentChildRoutes from "./src/routes/parentChild.js";

import { initSockets } from "./src/sockets/socketHandler.js";

// create Express instance
const app = express();

// Enable JSON reading
app.use(express.json());
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Set up routes
app.use("/api/alerts", alertRoutes);
app.use("/api/commutes", commuteRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/safeZones", safeZoneRoutes);
app.use("/api/users", userRoutes);
app.use("/api/linkTokens", linkTokenRoutes);
app.use("/api/parentChildren", parentChildRoutes);

// Create http server
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// Socket logic
initSockets(io);

// Connect to MySQL database
await ConnectDB();

// Start server
httpServer.listen(5001, "0.0.0.0", () => {
    console.log("Server is running on port 5001");
})