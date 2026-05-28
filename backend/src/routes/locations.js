import express, { json } from "express";
import {db} from "../lib/db.js"
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// Checks if child has a model and scaler 
const checkForModel = async (childId) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT model_ready, scaler_ready FROM model_registry WHERE child_id = ?",
            [childId],
            (err, results) => {
                if (err) return reject(err);
                if (!results || !results.length) return resolve(null);
                resolve(results[0]);
            }
        )
    })
}

const isModelReady = async (childId) => {
    const row = await checkForModel(childId);
    return row?.model_ready && row?.scaler_ready;
}

router.post("/send-location", (req, res) => {
    // Grab socket.io server
    const io = req.app.get("io");

    // Verify all fields are valid
    const {childId, time, lng, lat, speed} = req.body;
    if (childId === null || time === null || lng === null || lat === null || speed === null) {
        return res.status(400).json({error: "Missing required location fields"});
    }

    // Send child location to parents
    io.to(`child:${childId}`).emit("location_update", {childId, lng, lat, speed});
    
    db.query(
        // Insert location into location table
        "INSERT INTO location(child_id, longitude, latitude, speed) VALUES(?,?,?,?)",
        [childId, lng, lat, speed],
        async (err, result) => {
            if (err) return res.status(500).json({error: err});
            // Detect anomaly
        (async () => {
            try {
                const modelReady = await isModelReady(childId);
                if (modelReady) {
                    // If model and scaler exists, check for anomaly
                    const mlResponse = await fetch(`${ML_SERVICE_URL}/detect-anomaly`, {
                        method: "POST",
                        headers: {"Content-Type" : "application/json"},
                        body: JSON.stringify({
                            child_id: childId,
                            longitude: lng,
                            latitude: lat, 
                            speed: speed,
                            time: time
                        })
                    });
    
                    const data = await mlResponse.json();

                    if (mlResponse.ok) {
                        return res.status(200).json({success: true, anomaly: data.anomaly, score: data.score});
                    } else {
                        if (data.detail) return res.status(200).json({success: true, anomaly: null, error: data.detail})
                    }
                } else {
                    return res.status(200).json({success: true, anomaly: null, error: "Model is not ready"})
                }
            } catch (error) {
                console.log("ML service error:", error);
                return res.status(200).json({success: true, anomaly: null, error});
            }
        })();
        }
    );
})

export default router;