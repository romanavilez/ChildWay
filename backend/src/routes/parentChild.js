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
            if (err) {
                if (err.code === "ER_DUP_ENTRY") return res.status(409).json({error: `Already added ${childId} to your account`});
                else return res.status(500).json({error: "Database error"});
            }
            return res.status(200).json({success:true});
        }
    );
})

router.get("/get-all-children/:parentId", (req, res) => {
    const {parentId} = req.params;

    db.query(
        `
        SELECT pc.child_id, u.profile_pic FROM parent_child pc 
        JOIN user u ON u.username = pc.child_id        
        WHERE pc.parent_id = ?
        `,
        [parentId],
        (err, results=[]) => {
            if (err) res.status(500).json({error: err});
            const children = results.map((row) => ({childId: row.child_id, profilePic: row.profile_pic}));
            return res.status(200).json({res: children});
        }
    )
})

router.get("/get-all-parents/:childId", (req, res) => {
    const {childId} = req.params;

    db.query(
        "SELECT parent_id FROM parent_child WHERE child_id = ?", 
        [childId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({parents: results});
        }
    );
})

export default router;