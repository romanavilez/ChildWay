import express from 'express'
import { db } from '../lib/db.js'
import { sendPushNotification } from '../services/sendNotification.js';

const router = express.Router();

router.post("/store-push", (req, res) => {
    const {deviceId, token, userId, platform} = req.body;
    
    if (!deviceId || !token || !userId || !platform) {
        return res.status(400).json({error: "Missing required attributes"});
    }

    db.query(
        `INSERT INTO push_token (device_id, token, user_id, platform) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        token = VALUES (token), user_id = VALUES (user_id), platform = VALUES (platform)`,
        [deviceId, token, userId, platform],
        (err, results) => {
            if (err) {
                return res.status(500).json({error: err});
            }
            return res.status(200).json({success: true});
        }
    )
});

router.post("/send-message/:userId", (req, res) => {
    const {userId} = req.params;
    const {title, body, data} = req.body;

    if (!title || !body) return res.status(400).json({error: "Missing title or body"});

    db.query(
        "SELECT token FROM push_token WHERE user_id = ?",
        [userId],
        async (err, results=[]) => {
            if (err) return res.status(500).json({error: "DB error"});
            if (!results.length) return res.status(404).json({error: `No push tokens registered for ${userId}`});
            await sendPushNotification(results.map((t) => t.token), {title, body, data});
        }
    )
}) 

export default router;