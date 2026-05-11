import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/auth.store';

export const LOCATION_TASK = "location-task";

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
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/locations/send-location`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({childId, time, lng, lat, speed})
            })

            const data = await res.json();

            if (!res.ok) console.log("location not sent:", data.error);
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