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
            // Grab username if found and set socket.user and userType
            const username = results[0].username;
            if (!username) return next(new Error("User not found"));
            const role = results[0].role;
            socket.user = username;
            socket.role = role;
            // Continue with connection
            next();
        });
    });
    // Handle connection
    io.on("connection", (socket) => {
        console.log("Connected to socket: ", socket.id);
        console.log("Connected as: ", socket.user);

        const userId = socket.user;

        if (socket.role === "child") {
            // child joins its own room
            socket.join(`child:${userId}`);
            // send location data
            socket.on("start_sending_location", () => {
                socket.to(`child:${userId}`).emit("start_sending_location");
            })
        } else if (socket.role === "parent") {
            // verify that user is child's parent and join room
            socket.on("join_child", (childId) => {
                const query = "SELECT * FROM parent_child WHERE parent_id = ? AND child_id = ?";
                db.query(query, [userId, childId], (err, results=[]) => {
                    if (results.length === 0) return socket.emit("error", "Not a parent");
                    socket.join(`child:${childId}`);
                });
            });
        } 
        // Leave child's room
        socket.on("leave_child", (childId) => {
            socket.leave(`child:${childId}`);
        })

    });
};