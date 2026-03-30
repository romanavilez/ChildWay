import express from "express";
import cors from "cors";
import { ConnectDB } from "./lib/db.js";

// create Express instance
const app = express();

// Enable JSON reading
app.use(express.json());
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Set up routes


// Connect to MySQL database
await ConnectDB();

// Start server
app.listen(5001, () => {
    console.log("Server is running on port 5001");
})