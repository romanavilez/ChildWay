import {io, Socket} from 'socket.io-client'

let socket : Socket | null = null;

export const connectSocket = (userId:String) => {
    console.log("connect socket");
    // If already connected, return socket
    if (socket?.connected) return socket;
    // Connect to socket on server
    socket = io("http://10.0.0.99:5001", {
        auth: {userId}
    });
    // return if successful
    return socket;
}

export const disconnectSocket = () => {
    if (socket) { 
        console.log("disconnect socket");
        socket.disconnect();
        socket = null;
    }
}

export const getSocket = () => socket;