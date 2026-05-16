import express from "express";
import {db} from "../lib/db.js"

const router = express.Router();

router.post("/add-alert", (req, res) => {
    const {childId, type, body} = req.body;
    if (!childId || !type || !body) return res.status(400).json({error: "Mising alert creation fields"});

    db.query(
        "INSERT INTO alert(child_id, alert_type, alert_body) VALUES(?,?,?)",
        [childId, type, body],
        (err, results) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({success: true});
        }
    )
});

router.get("/all-alerts/:parentId", (req, res) => {
    const {parentId} = req.params;

    db.query(
        `
            SELECT pc.child_id, a.time, a.alert_body FROM alert a
            JOIN parent_child pc ON pc.child_id = a.child_id
            WHERE pc.parent_id = ?
            ORDER BY a.time DESC
        `,
        [parentId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({alerts: results});
        }
    )
});

export default router;