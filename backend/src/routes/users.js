import express from "express";
import {db} from "../lib/db.js"
import bcrypt from 'bcrypt'

const router = express.Router();

// GET user by username
router.post("/login", (req, res) => {
    // check for required fields
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({error: "Missing required fields."});
    }

    db.query(
        "SELECT * FROM user WHERE username = ?",
        [username],
        async (err, results=[]) => {
            if (err) {
                return res.status(500).json({error: "Database error", detail: err.message});
            }
            // username is not in database
            if (results.length === 0) {
                return res.status(401).json({error: "We couldn't log you in. Please check your credentials and try again."});
            }
            // verify if password is correct
            const passwordMatch = await bcrypt.compare(password, results[0].password_hash);
            if (passwordMatch) {
                console.log()
                return res.status(200).json({message: "User authenticated succesfully", role: results[0].role});
            } else {
                return res.status(401).json({error: "We couldn't log you in. Please check your credentials and try again."});
            }
        } 
    );
})

// Sign up user
router.post("/signup", async (req, res) => {
    // check for required fields
    const {username, email, password, role} = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).json({error: "missing required fields"});
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // add new user to user table
    db.query(
        "INSERT INTO user(username, email, password_hash, role) VALUES(?,?,?,?)",
        [username, email, passwordHash, role],
        (err, result) => {
            if (err) {
                // duplicate entry
                if (err.code === 'ER_DUP_ENTRY') {
                    if (err.message.includes('user.PRIMARY')) {
                        return res.status(409).json({error: "Username already taken."})
                    } else if (err.message.includes('user.email')) {
                        return res.status(409).json({error: "Email already taken."})
                    }
                }
                // database error
                return res.status(500).json({error: err.message});
            }
            return res.status(200).json({success:true});
        }
    )

});

export default router;