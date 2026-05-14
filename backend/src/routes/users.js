import express from "express";
import {db} from "../lib/db.js"
import bcrypt from 'bcrypt'
import upload from '../lib/multer.js'
import cloudinary from '../lib/cloudinary.js'

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

// Update profile picture
router.post("/update-profile-pic", upload.single('image') , async (req, res) => {
    const {userId} = req.body;

    if (!userId) return res.status(400).json({error: "Missing required profile pic update fields"});

    if (!req.file) {
        return res.status(400).json({error: "no image uploaded"});
    }
    // upload picture to cloudinary
    const result = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: 'profile_pictures'
        }
    );
    // grab cloudinary url
    const imageUrl = result.secure_url;
    // update user profile pic in database
    db.query(
        "UPDATE user SET profile_pic = ? WHERE username = ?",
        [imageUrl, userId],
        (err, results) => {
            if (err) return res.status(500).json({error: err});
            return res.status(200).json({success: true, imageUrl: imageUrl});
        }
    )
});

// Grab profile picture
router.get("/profile-pic/:userId", (req, res) => {
    const {userId} = req.params;

    db.query(
        "SELECT profile_pic FROM user WHERE username = ?",
        [userId],
        (err, results=[]) => {
            if (err) return res.status(500).json({error: err});
            if (results.length === 0) return res.status(404).json({error: "User not found"});
            if (results[0].profile_pic === null) return res.status(200).json({success: false})
            return res.status(200).json({success: true, profilePic: results[0].profile_pic});
        }
    )
});

export default router;