import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { Alert, Platform } from 'react-native'

// Controls how notifications appear
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    })
});

export const registerForPushNotifications = async () => {
    // Cannot send notifications on simulators
    if (!Device.isDevice) return null;
    // Channels are required on android
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }
    // Check for notification permissions
    const { status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // If notification permissions are disabled, ask for them
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    // Alert if notification permission isn't granted
    if (finalStatus !== 'granted') {
        return Alert.alert("Push Notification Error", "Failed to get token for push notifications");
    }
    // Grab and return token
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({projectId});
    return token;
}