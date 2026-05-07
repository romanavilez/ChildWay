import express from "express"
import { db } from "../lib/db.js"

const router = express.Router();

router.post("/create-conversation", (req, res) => {
    const {type} = req.body;
    if (!type) return res.status(400).json({error: "Missing conversation type"});

    db.query(
        "INSERT INTO conversation(type) VALUES(?)",
        [type],
        (err, result) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({conversationId: result.conversation_id});
        }
    );
});

router.get("/get-all-conversations/:userId", (req, res) => {
    const {userId} = req.params;

    db.query(
        `
        SELECT c.conversation_id, cp2.user_id FROM conversation c
        JOIN conversation_participant cp1 ON c.conversation_id = cp1.conversation_id
        JOIN conversation_participant cp2 ON c.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = ? AND cp2.user_id != ? AND c.type = 'direct'
        `,
        [userId, userId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({conversations: results});
        }
    );
})

router.post("/add-participant", (req, res) => {
    const {conversationId, userId} = req.body;
    if (!conversationId || !userId) return res.status(400).json({error: "Missing required Ids"});

    db.query(
        "INSERT INTO conversation_participant(conversation_id, user_id) VALUES(?,?)",
        [conversationId, userId],
        (err, result) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({success: true});
        }
    );
})

router.get("/get-all-participants/:conversationId", (req, res) => {
    const {conversationId} = req.params;

    db.query(
        "SELECT user_id FROM conversation_participants WHERE conversation_id = ?",
        [conversationId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({participants: results});
        }
    )
})

export default router;