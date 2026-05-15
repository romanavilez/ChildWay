import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
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

    const sendSosNotification = async () => {
        try {
            const title = `SOS Alert from ${childId}`;
            const body = notificationBody === "" ? "Tap to view their location." : notificationBody;
            const data = {sender: childId, type: "sos"}
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/pushTokens/send-sos`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({title, body, data})
            });
    
            if (res.ok) console.log("message sent");
        } catch (error) {
            console.log("Couldn't send notification:", error);
        }
    }

    const call911 = async () => {
        const phoneNumber = "4255337117";

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
                        onPress={() => {sendSosNotification(); setNotificationBody("")}}
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
                        <TouchableOpacity className='absolute right-2' onPress={() => {sendSosNotification(); setNotificationBody("")}}>
                            <Image source={require('@/assets/icons/send.png')} className='h-7 w-7'/>
                        </TouchableOpacity>
                    </View>
                    {/* Call 911 button */}
                    <TouchableOpacity 
                        className='flex justify-center items-center h-1/2 rounded-2xl mt-4 overflow-hidden'
                        onPress={call911}
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
        </View>
    )
}

export default sos