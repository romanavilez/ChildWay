import express from "express";
import {db} from "../lib/db.js"

const router = express.Router();

// GET user by username and password (for login)
router.post("/login", (req, res) => {
    // check for required fields
    const {username} = req.body;
    if (!username) {
        return res.status(400).json({error: "Missing required fields"});
    }

    db.query(
        "SELECT * FROM user WHERE username = ?",
        [username],
        (err, results=[]) => {
            if (err) {
                return res.status(500).json({error: "Database error", detail: err.message});
            }

            if (results.length === 0) {
                return res.status(401).json({error: "Invalid username or password"});
            }
            
            return res.status(200).json({message: "User authenticated succesfully", user: results[0]});
        } 
    );
})

export default router;