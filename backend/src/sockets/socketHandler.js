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
            console.log({userId}, ":", socket.rooms);
        } else if (socket.role === "parent") {
            // verify that user is child's parent and join room
            socket.on("join_child", (childId) => {
                const query = "SELECT * FROM parent_child WHERE parent_id = ? AND child_id = ?";
                db.query(query, [userId, childId], (err, results=[]) => {
                    if (results.length === 0) return socket.emit("error", "Not a parent");
                    socket.join(`child:${childId}`);
                    console.log({userId}, ":", socket.rooms);
                });
            });
        } 

        // Open own room
        socket.on("open_self", () => {
            socket.join(`user:${userId}`);
        })

        // Close own room
        socket.on("close_self", () => {
            socket.leave(`user:${userId}`);
        })

        // Open message room
        socket.on("open_message", (currentConversation) => {
            socket.join(`message:${currentConversation}`);
        })

        // Send message
        socket.on("send_message", (data) => {
            socket.to(`message:${data.conversationId}`).emit("receive_message", data);
            socket.to(`user:${data.conversationPartner}`).emit("conversation_update", data);
        })

        // Close message room
        socket.on("close_message", (currentConversation) => {
            socket.leave(`message:${currentConversation}`);
        })

        // Leave child's room
        socket.on("leave_child", (currentConversation) => {
            socket.leave(`child:${currentConversation}`);
        })

    });
};