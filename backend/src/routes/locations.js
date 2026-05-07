import express, { json } from "express";
import {db} from "../lib/db.js"
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

router.post("/send-location", (req, res) => {
    // Grab socket.io server
    const io = req.app.get("io");

    try {
        // Verify all fields are valid
        const {childId, time, lng, lat, speed} = req.body;
        if (!childId || !time || !lng || !lat || !speed) {
            return res.status(400).json({error: "Missing required location fields"});
        }
        // Send child location to parents
        io.to(`child:${childId}`).emit("location_update", {childId, lng, lat, speed});
        
        // db.query(
        //     // Insert location into location table
        //     "INSERT INTO location(child_id, longitude, latitude, speed, time) VALUES(?,?,?,?,?)",
        //     [childId, lng, lat, speed, time],
        //     async (err, result) => {
        //         if (err) return res.status(500).json({error: err});
        //         // Calculate time and day
        //         const timeOfDay = time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600;
        //         const dayOfWeek = time.getDay();
        //         // Detect anomaly
        //         try {
        //             const mlResponse = await fetch(`${ML_SERVICE_URL}/detect-anomaly`, {
        //                 method: "POST",
        //                 headers: {"Content-Type" : "application/json"},
        //                 body: JSON.stringify({
        //                     longitude: lng,
        //                     latitude: lat, 
        //                     speed: speed,
        //                     time: timeOfDay,
        //                     day_of_week: dayOfWeek
        //                 })
        //             });

        //             const {anomaly, score} = await mlResponse.json();
        //             if (anomaly) console.log("Anomaly detected:", score);

        //             return res.status(200).json({success: true, anomaly, score});
        //         } catch (error) {
        //             console.log("ML service error:", error);
        //             return res.status(200).json({success: true, anomaly=null});
        //         }
        //     }
        // );
        return res.status(200).json({success: true});
    } catch (err) {
        return res.status(500).json({error: err})
    }
})

export default router;