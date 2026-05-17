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

router.post("/send-message", (req, res) => {
    const {recipient, conversationId, title, body, data} = req.body;
    if (!recipient || !conversationId || !title || !body || !data) return res.status(400).json({error: "Missing required notification fields"});

    const io = req.app.get("io");
    // get all scokets in room
    const roomName = `message:${conversationId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    // check if recipient is connected to this room
    const recipientInRoom = room && [...room].some((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        return socket?.user === recipient;
    });
    // Don't send notification if recipient in room
    if (recipientInRoom) {
        return res.status(200).json({success: true, skipped: true})
    }

    db.query(
        "SELECT token FROM push_token WHERE user_id = ?",
        [recipient],
        async (err, results=[]) => {
            if (err) return res.status(500).json({error: "Could not grab push token"});
            if (!results.length) return res.status(404).json({error: `${userId} does not have a registered push token`});
            await sendPushNotification(results.map((t) => t.token), {title, body, data});
            return res.status(200).json({success: true, skipped: false});
        }
    )
})

router.post("/send-sos", (req, res) => {
    const {title, body, data} = req.body;
    if (!title || !body || !data) return res.status(400).json({error: "Missing required notification fields"});

    db.query(
        `
        SELECT pt.token FROM push_token pt
        JOIN parent_child pc ON pc.parent_id = pt.user_id
        WHERE child_id = ?
        `,
        [data.sender],
        async (err, results=[]) => {
            if (err) return res.status(500).json({error: "Error getting parents"});
            if (!results.length) return res.status(404).json({error: "No parents are registered for push notifications"});
            await sendPushNotification(results.map((t) => t.token), {title, body, data});
            return res.status(200).json({success: true});
        }
    )
})

export default router;