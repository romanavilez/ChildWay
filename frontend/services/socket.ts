import {io, Socket} from 'socket.io-client'
import { getCurrentPositionAsync } from 'expo-location';


let socket : Socket | null = null;
let interval : ReturnType<typeof setInterval> | null = null;

export const connectSocket = (userId:String, userType:String) => {
    // If already connected, return socket
    if (socket?.connected) return socket;
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
    // Handle sending location
    socket.on("start_sending_location", () => {
        // interval is already set
        if (interval) return;
        // Send location every 5 seconds
        interval = setInterval(async () => {
            let location = await getLocation();
            
            socket?.emit("location_update", ({
                childId: userId,
                latitude: location.latitude,
                longitude: location.longitude
            }))
        }, 5000);
    });
    // Stop sendling location
    socket.on("stop_sending_location", () => {
        if (interval) {
            // clear interval
            clearInterval(interval);
            interval = null;
        }
    })

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