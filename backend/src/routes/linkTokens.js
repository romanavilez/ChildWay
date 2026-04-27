import express from 'express'
import { db } from '../lib/db.js'
import crypto from 'crypto'

const router = express.Router();

// Search database for 
router.post("/verify-link-token", (req, res) => {
    const {tokenId} = req.body;

    db.query(
        "SELECT * FROM link_token WHERE token_id = ?",
        [tokenId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            if (!results) return res.status(404).json({error: "Link token not found"});
            return res.status(200).json({success:true, childId:results[0].child_id});
        }
    );
});

router.post("/generate-link-token", (req, res) => {
    const {childId} = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const used = false;

    db.query(
        "INSERT INTO link_token(token_id, child_id, expires_at, used) VALUES (?,?,?,?)",
        [token, childId, expiresAt, used],
        (err, result) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({token, expiresAt});
        }
    )
});


export default router;