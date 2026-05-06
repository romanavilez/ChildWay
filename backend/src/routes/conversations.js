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
        "SELECT conversation_id FROM conversation_participant WHERE user_id = ?",
        [userId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({conversationIds: results});
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