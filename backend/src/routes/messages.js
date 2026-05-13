import express from "express"
import { db } from "../lib/db.js"

const router = express.Router();

router.post("/create-message", (req, res) => {
    const {conversationId, sender, text} = req.body;
    if (!conversationId || !sender || !text) return res.status(400).json({error: "Missing required message fields"});

    db.query(
        "INSERT INTO message(conversation_id, sender_id, message_text) VALUES (?,?,?)",
        [conversationId, sender, text],
        (err, result) => {
            if (err) return res.status(500).json({error: err});

            db.query(
                "SELECT created_at FROM message WHERE message_id = ?",
                [result.insertId],
                (err, results=[]) => {
                    if (err) res.status(500).json({error: "Could not get time"});
                    return res.status(200).json({time: results[0].created_at});
                }
            )
        }
    );
});

router.get("/get-all-messages/:conversationId", (req, res) => {
    const {conversationId} = req.params;

    db.query(
        "SELECT * FROM message WHERE conversation_id = ? ORDER BY created_at ASC",
        [conversationId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({messages: results});
        }
    )
});

export default router;