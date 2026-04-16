import {io, Socket} from 'socket.io-client'
import { getCurrentPositionAsync } from 'expo-location';
import { use } from 'react';


let socket : Socket | null = null;
let interval : ReturnType<typeof setInterval> | null = null;

export const connectSocket = (userId:String, userType:String) => {
    // If socket exists, disconnect
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    // Connect to socket on server
    socket = io("http://10.0.0.99:5001", {
        auth: {userId, userType}
    });
    // verify connection
    socket.on("connect", () => {
        console.log("CONNECTION IN FRONT END:", socket?.id);
    })

    // Get user's coordinates
    const getLocation = async () => {
        let loc = await getCurrentPositionAsync({});
        console.log("getLocation:", loc.coords);
        return loc.coords;
    }

    if (userType === "child") {
        // Handle sending location
        socket.on("start_sending_location", () => {
            console.log("start sending location");
            // interval is already set
            if (interval) return;
            // Send location every 5 seconds
            const sendLocation = async () => {
                let location = await getLocation();
                socket?.emit("location_update", ({
                    childId: userId,
                    latitude: location.latitude,
                    longitude: location.longitude
                }))
            }
            sendLocation();
            interval = setInterval(sendLocation, 5000);
        });
        // Stop sendling location
        socket.on("stop_sending_location", () => {
            console.log("stop sending location");
            if (interval) {
                // clear interval
                clearInterval(interval);
                interval = null;
            }
        });
    }

    return socket;
}

export const disconnectSocket = () => {
    if (socket) { 
        console.log("disconnect socket:", socket.id);
        socket.disconnect();
        socket = null;
    }
}

export const getSocket = () => socket;