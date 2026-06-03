import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/auth.store';

export const LOCATION_TASK = "location-task";

const storeAlert = async (childId: string) => {
        const alertType = "anomaly";
        const alertBody = "⁉️ Unusual Activity Detected";
        // store alert
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/alerts/add-alert`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({childId, alertType, alertBody})
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                console.log("Failed to store alert:", data.error);
            } 
        } catch (error) {
            console.log("Failed to store alert:", error);
        }
    }

const sendAnomalyNotification = async (anomaly: string, childId: string) => {
    try {
        const title = `⁉️ ${childId}: Unusual Activity Detected`;
        const body = anomaly;
        const data = {sender: childId, type: "anomaly"}
        // store alert before sending notification
        storeAlert(childId);
        // send notification
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pushTokens/send-notification`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({title, body, data})
        })
    
        const data_ = await res.json();
    
        if (!res.ok) console.log("Error sending alert notification:", data_.error);
    } catch (error) {
        console.log("Couldn't send notification:", error);
    }
}

TaskManager.defineTask(LOCATION_TASK, async ({data, error}) => {
    if (error) {
        console.log("Task manager error:", error);
        return;
    }

    const {username:childId} = useAuthStore.getState();

    if (!childId) {
        console.log("No childId yet, skipping location update");
        return;
    }

    if (data) {
        const {locations} = data as {
            locations: Location.LocationObject[]
        }
        const latest = locations[locations.length - 1];
        const time = new Date(latest.timestamp);
        const lng = latest.coords.longitude;
        const lat = latest.coords.latitude;
        const speed = latest.coords.speed;
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/locations/send-location`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({childId, time, lng, lat, speed})
            })

            const data = await res.json();
            if (res.ok) {
                if (data.anomaly !== null) {
                    if (data.anomaly) {
                        sendAnomalyNotification(data.explanation, childId);
                    } 
                    else {
                        console.log("No anomaly");
                    }
                } 
                else {
                    console.log("Could not detect anomaly:", data.error);
                }
            } else {
                console.log("location not sent:", data.error);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("no data");
    }
});

export const startLocationTracking = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') return;

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') return;

    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

    if (!started) {
        // await Location.stopLocationUpdatesAsync(LOCATION_TASK);
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 0,
            foregroundService: {
                notificationTitle: "Location Tracking",
                notificationBody: "Tracking location in background",
            },
            pausesUpdatesAutomatically: false
        });
    }
}

export const stopLocationTracking = async () => {
    try {
        const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
        if (started) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    } catch (error) {
        console.log("could not stop tracking:", error);
    }
}