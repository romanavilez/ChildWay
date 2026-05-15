import { useEffect, useRef } from "react"
import * as Notifications from 'expo-notifications'
import { registerForPushNotifications } from "@/services/registerForPush"
import { Platform } from "react-native"
import * as SecureStore from 'expo-secure-store'
import 'react-native-get-random-values'
import {v4 as uuidv4} from 'uuid'
import { router } from "expo-router"

const DEVICE_KEY = "device_id";

const getDeviceId = async () => {
    // grab device id
    let deviceId = await SecureStore.getItemAsync(DEVICE_KEY);
    // if no id for this device, create one
    if (!deviceId) {
        deviceId = uuidv4();
        await SecureStore.setItemAsync(DEVICE_KEY, deviceId);
    }
    return deviceId;
}

export const useNotifications = (userId:string | null) => {
    // Use refs
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        if (!userId) return;

        registerForPushNotifications().then( async (token) => {
            if (!token) return;

            try {
                // store push token
                const deviceId = await getDeviceId();
                const platform = Platform.OS;
                
                const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/pushTokens/store-push`, {
                    method: "POST",
                    headers: {"Content-Type" : "application/json"},
                    body: JSON.stringify({deviceId, token, userId, platform})
                });
    
                const data = await res.json();
    
                if (res.ok) {
                    console.log("Push token stored:", data.success);
                } else {
                    console.log("Error storing push token:", data.error);
                }
            } catch (error) {
                console.log("Failed to store push token:", error);
            }

        });
        
        // notification sent
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("notification:",notification);
        });

        // user clicks on notification
        const handleNotification = (response : any) => {
            const notificationType = response.notification.request.content.data.type; 
            if (notificationType === 'sos') router.push("/children");
            else if (notificationType === 'message') router.push("/messages");
        }
        responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotification);

        // Handle notification if app was killed
        (() => {
            const response = Notifications.getLastNotificationResponse();
            if (response) handleNotification(response);
        })();

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        }
    }, [userId]);
}