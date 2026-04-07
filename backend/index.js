import express from "express";
import cors from "cors";
import { ConnectDB } from "./src/lib/db.js";

import alertRoutes from "./src/routes/alerts.js";
import commuteRoutes from "./src/routes/commutes.js";
import locationRoutes from "./src/routes/locations.js";
import safeZoneRoutes from "./src/routes/safeZones.js";
import userRoutes from "./src/routes/users.js";

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


// Connect to MySQL database
await ConnectDB();

// Start server
app.listen(5001, () => {
    console.log("Server is running on port 5001");
})