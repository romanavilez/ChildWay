import {Expo} from 'expo-server-sdk'

const expo = new Expo();

export const sendPushNotification = async (
    tokens,
    payload
) => {
    // only grab valid tokens
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
    // create the messages to send to clients
    const messages = validTokens.map((token) => ({
        to: token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        priority: "high"
    }));
    // Send notifications by chunks
    const chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('result of sending push message to expo:', ticketChunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.log('Error sending chunk:', error);
        }
    }
}