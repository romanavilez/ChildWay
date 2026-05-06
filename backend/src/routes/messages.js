import express from "express"
import { db } from "../lib/db.js"

const router = express.Router();

router.post("/create-message", (req, res) => {
    const {conversation_id, sender, text} = req.body;
    if (!conversation_id || !sender || !text) return res.status(400).json({error: "Missing required message fields"});

    db.query(
        "INSERT INTO message(conversation_id, sender_id, message_text) VALUES (?,?,?)",
        [conversation_id, sender, text],
        (err, result) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({time: result.created_at});
        }
    );
})

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
})

export default router;