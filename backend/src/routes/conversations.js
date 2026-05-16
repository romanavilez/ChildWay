import express from "express"
import { db } from "../lib/db.js"

const router = express.Router();

router.post("/create-conversation", (req, res) => {
    const {type, cp1, cp2} = req.body;
    if (!type || !cp1 || !cp2) return res.status(400).json({error: "Missing required conversation fields"});
    // Check if conversation already exists
    db.query(
        `
        SELECT c.conversation_id FROM conversation c
        JOIN conversation_participant cp1 on c.conversation_id = cp1.conversation_id
        JOIN conversation_participant cp2 on c.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = ? AND cp2.user_id = ? AND c.type = ?
        `,
        [cp1, cp2, type],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            if (results.length > 0) return res.status(200).json({success: false, conversationId: results[0].conversation_id});
            // if conversation doesn't exist, insert a new one
            db.query(
                "INSERT INTO conversation(type) VALUES(?)",
                [type],
                (err, result) => {
                    if (err) return res.status(500).json({error: err});
                    return res.status(200).json({success: true, conversationId: result.insertId});
                }
            );
        }
    )

});

router.get("/get-all-conversations/:userId", (req, res) => {
    const {userId} = req.params;

    db.query(
        `
        SELECT c.conversation_id, c.last_message, c.message_time, cp1.unread_messages, cp2.user_id, u.profile_pic FROM conversation c
        JOIN conversation_participant cp1 ON c.conversation_id = cp1.conversation_id
        JOIN conversation_participant cp2 ON c.conversation_id = cp2.conversation_id
        JOIN user u ON u.username = cp2.user_id
        WHERE cp1.user_id = ? AND cp2.user_id != ? AND c.type = 'direct'
        ORDER BY c.message_time DESC
        `,
        [userId, userId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            console.log("results:",results);
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
});

router.post("/update-last-message", (req, res) => {
    const {message, conversationId} = req.body;
    if (!message || !conversationId) return res.status(400).json({error: "Missing last message update fields"});

    db.query(
        "UPDATE conversation SET last_message = ?, message_time = NOW() WHERE conversation_id = ?",
        [message, conversationId],
        (err, results) => {
            if (err) return res.status(500).json({error: err});
            if (results.affectedRows === 0) {
                return res.status(404).json({error: "conversation not found"});
            }
            return res.status(200).json({success: true});
        }
    )
});

router.post("/increase-unread-messages", (req, res) => {
    const {conversationId, userId} = req.body;
    if (!conversationId || !userId) return res.status(400).json({error: "Missing increase unread message fields"});

    db.query(
        "UPDATE conversation_participant SET unread_messages = unread_messages + 1 WHERE conversation_id = ? AND user_id = ?",
        [conversationId, userId],
        (err, results) => {
            if (err) return res.status(500).json({error: err});
            if (results.affectedRows === 0) {
                return res.status(404).json({error: "conversation participation not found"});
            }
            return res.status(200).json({success: true});
        }
    )
});

router.post("/zero-unread-messages", (req, res) => {
    const {conversationId, userId} = req.body;
    if (!conversationId || !userId) return res.status(400).json({error: "Missing zero unread message fields"});

    db.query(
        "UPDATE conversation_participant SET unread_messages = 0 WHERE conversation_id = ? AND user_id = ?",
        [conversationId, userId],
        (err, results) => {
            if (err) return res.status(500).json({error: err});
            if (results.affectedRows === 0) {
                return res.status(404).json({error: "conversation participant not found"});
            }
            return res.status(200).json({success: true});
        }
    )
});

export default router;