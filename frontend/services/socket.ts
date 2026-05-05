import {io, Socket} from 'socket.io-client'

let socket : Socket | null = null;

// On connection, join each child's room
const joinChildren = (children: string[]) => {
    console.log("Socket id:", socket?.id);
    for (const child of children) {
        console.log("joining child:", child)
        socket?.emit("join_child", child);
    }
}

const handleConnect = async (userId: String, socket: Socket) => {
    try {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/get-all-children/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "applicaton/json"}
        })

        const data = await res.json();

        if (res.ok) {
            // handle connection when socket connects
            const children = data.res;
            if (socket.connected) joinChildren(children.map((child:any) => child.child_id));
            else socket.once("connect", () => joinChildren(children.map((child:any) => child.child_id)));
        }

    } catch (error) {
        console.log("Error getting children:", error);
    }
}

const leaveAllChildren = async (userId:string) => {
    try {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/get-all-children/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "applicaton/json"}
        })
        
        const data = await res.json();

        if (res.ok) {
            const children = data.res;
            if (socket?.connected) {
                for (const child of children) {
                    socket.emit("leave_child", child);
                }
            }
        }
    } catch (error) {
        console.log("Error leaving children:", error);
    }
}

export const connectSocket = (userId:string, userType:string) => {
    // If socket exists, disconnect
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    // Connect to socket on server
    socket = io(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001`, {
        auth: {userId, userType}
    });
    // verify connection
    socket.on("connect", () => {
        console.log("CONNECTION IN FRONT END:", socket?.id);
    })

    if (userType === 'parent') {
        handleConnect(userId, socket);
    }

    return socket;
}

export const disconnectSocket = (userType: string, userId: string) => {
    if (socket) { 
        if (userType === 'parent') leaveAllChildren(userId);
        console.log("disconnect socket:", socket.id);
        socket.disconnect();
        socket = null;
    }
}

export const getSocket = () => socket;