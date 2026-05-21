import { View, Text, TouchableOpacity, TextInput, Image, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/store/auth.store'
import * as Linking from 'expo-linking'

const sos = () => {
    // variables
    const childId = useAuthStore((state) => state.username);

    // use states
    const [notificationBody, setNotificationBody] = useState("");
    const [sosConfirmationOpen, setSosConfirmationOpen] = useState(false);
    const [emergencyConfirmationOpen, setEmergencyConfirmationOpen] = useState(false);

    const storeAlert = async (type: string, notificationBody: string) => {
        const alertType = "sos";
        let alertBody = "";
        // set alert body
        if (type === "sos") {
            alertBody = notificationBody === "" ? "Sent an SOS ⚠️" : `SOS: ${notificationBody}`;
        } else if (type === '911') {
            alertBody = "Called 911 🚨"
        }
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

    const sendAlertSosNotification = async () => {
        try {
            const title = `⚠️ SOS Alert from ${childId}`;
            const body = notificationBody === "" ? "Tap to view their location." : notificationBody;
            const data = {sender: childId, type: "sos"}
            // store alert before sending notification
            storeAlert("sos", notificationBody);
            // send notification
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pushTokens/send-notification`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({title, body, data})
            });

            const data_ = await res.json();
    
            if (!res.ok) console.log("Error sending alert notification:", data_.error);
        } catch (error) {
            console.log("Couldn't send notification:", error);
        }
    }

    const send911AlertNotification = async () => {
        try {
            const title = `${childId} called 911 🚨`;
            const body = "Tap to view their location.";
            const data = {sender: childId, type: "sos"}
            // store alert before sending notification
            storeAlert("911", notificationBody);
            // send notification
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pushTokens/send-notification`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({title, body, data})
            });

            const data_ = await res.json();
    
            if (!res.ok) console.log("Error sending 911 notification:", data_.error);
        } catch (error) {
            console.log("Couldn't send notification:", error);
        }
    }

    const call911 = async () => {
        const phoneNumber = "1234567890";

        try {
            await Linking.openURL(`tel:${phoneNumber}`);
        } catch (error) {
            console.log("Failed to open phone app");
        }
    }

    return (
        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <View className='w-full flex-1 rounded-2xl bg-[#12151D] mb-2 p-3'>
                    {/* Alert parents button */}
                    <TouchableOpacity 
                        className='flex justify-center items-center h-2/5 rounded-t-2xl overflow-hidden' 
                        onPress={() => setSosConfirmationOpen(true)}
                    >
                        <LinearGradient 
                            className={`absolute w-full h-full`}
                            colors={['#10E5B2', '#72f38e']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text className='font-staatliches text-3xl text-white'>ALERT PARENTS</Text>
                    </TouchableOpacity>
                    <View className='flex justify-center'>
                        <TextInput 
                            className='h-12 rounded-b-2xl bg-slate-800 font-staatliches text-xl text-white'
                            value={notificationBody}
                            onChangeText={setNotificationBody}
                            placeholder='MESSAGE...'
                            textAlign='center'
                        />
                        <TouchableOpacity className='absolute right-2' onPress={() => setSosConfirmationOpen(true)}>
                            <Image source={require('@/assets/icons/send.png')} className='h-7 w-7'/>
                        </TouchableOpacity>
                    </View>
                    {/* Call 911 button */}
                    <TouchableOpacity 
                        className='flex justify-center items-center h-1/2 rounded-2xl mt-4 overflow-hidden'
                        onPress={() => setEmergencyConfirmationOpen(true)}
                    >
                        <LinearGradient 
                            className='absolute w-full h-full'
                            colors={['#F54B64', '#FE9A3D']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text className='text-white text-3xl font-staatliches'>CALL 911</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Alert parents confirmation */}
            <Modal
                visible={sosConfirmationOpen}
                transparent
                animationType='fade'
            >
                <SafeAreaView className='flex-1 bg-secondary/90'>    
                    <View className='flex justify-center items-center w-full h-full'>
                        <View className='flex justify-center items-center w-[85%] h-[30%] bg-secondary-two rounded-2xl border-2 border-white'>
                            <Text className='font-staatliches text-white text-3xl'>Send SOS alert?</Text>
                            <Text className='font-staatliches text-slate-300 text-xl'>Your parent will be notified immediately.</Text>
                            <View className='flex-row gap-2 mt-10'>
                                <TouchableOpacity 
                                    className='flex justify-center items-center p-2 rounded-xl bg-tertiary w-1/4'
                                    onPress={() => setSosConfirmationOpen(false)}
                                >
                                    <Text className='font-staatliches text-white text-xl'>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className='flex justify-center items-center p-2 rounded-xl bg-primary w-1/4'
                                    onPress={() => {setSosConfirmationOpen(false); sendAlertSosNotification(); setNotificationBody("")}}
                                >
                                    <Text className='font-staatliches text-white text-xl'>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
            {/* Call 911 confirmation */}
            <Modal
                visible={emergencyConfirmationOpen}
                transparent
                animationType='fade'
            >
                <SafeAreaView className='flex-1 bg-secondary/90'>    
                    <View className='flex justify-center items-center w-full h-full'>
                        <View className='flex justify-center items-center w-[85%] h-[30%] bg-secondary-two rounded-2xl border-2 border-white'>
                            <Text className='font-staatliches text-white text-3xl'>Emergency call</Text>
                            <Text className='font-staatliches text-slate-300 text-xl'>Are you sure you want to call 911?</Text>
                            <View className='flex-row gap-2 mt-10'>
                                <TouchableOpacity 
                                    className='flex justify-center items-center p-2 rounded-xl bg-tertiary w-1/4'
                                    onPress={() => setEmergencyConfirmationOpen(false)}
                                >
                                    <Text className='font-staatliches text-white text-xl'>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className='flex justify-center items-center p-2 rounded-xl bg-primary w-1/4'
                                    onPress={() => {setEmergencyConfirmationOpen(false); call911(); send911AlertNotification()}}
                                >
                                    <Text className='font-staatliches text-white text-xl'>Call</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

export default sos