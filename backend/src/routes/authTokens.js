import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();

router.post("/refresh", (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) return res.status(400).json({error: "Missing refresh token"});

    try {
        // verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
        );
        console.log("userId:", decoded.userId);
        console.log("role:", decoded.role);
        console.log("expiration:", decoded.exp * 1000);
        console.log("time now:", Date.now());
        // check if refresh token is expired
        if (decoded.exp * 1000 < Date.now()) {
            return res.status(403).json({error: "refresh token expired"})
        }
        // on verification, create new access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, role: decoded.role },
            process.env.ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json({accessToken: newAccessToken});
    } catch (error) {
        return res.status(500).json({error});
    }
});

export default router;