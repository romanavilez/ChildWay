import express from "express";
import {db} from "../lib/db.js"

const router = express.Router();

router.post("/pair-child", (req, res) => {
    const {parentId, childId} = req.body;
    if (!parentId || !childId) return res.status(401).json({error: "Missing pairing information"})

    db.query(
        "INSERT INTO parent_child (parent_id, child_id) VALUES (?,?)",
        [parentId, childId],
        (err, result) => {
            if (err) return res.status(500).json({error: "Database error"});
            return res.status(200).json({success:true});
        }
    );
})

export default router;