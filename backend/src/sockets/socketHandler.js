import { db } from "../lib/db.js";

export const initSockets = (io) => {
    // Check if user exists in database
    io.use((socket, next) => {
        // Grab user id from socket
        const userId = socket.handshake.auth.userId;
        // Look for userId in database
        const query = "SELECT * FROM user WHERE username = ?";
        db.query(query, userId, (err, results=[]) => {
            if (err) return next(new Error("DB error"));
            // Grab username if found and set socket.user
            const username = results[0].username;
            if (!username) return next(new Error("User not found"));
            socket.user = username;
            // Continue with connection
            next();
        });
    });

    io.on("connection", (socket) => {
        console.log("Connected to socket: ", socket.id);
        console.log("Connected as: ", socket.user);
    });
};