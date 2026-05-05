import express from "express";
import {db} from "../lib/db.js"

const router = express.Router();

router.post("/send-location", (req, res) => {
    // Grab socket.io server
    const io = req.app.get("io");

    try {
        const {childId, time, lng, lat, speed} = req.body;
        
        io.to(`child:${childId}`).emit("location_update", {childId, lng, lat, speed});

        return res.sendStatus(200);
    } catch (err) {
        return res.status(500).json({error: err})
    }
})

export default router;