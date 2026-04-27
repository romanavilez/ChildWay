import { View, Text, TouchableOpacity, Modal, Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'
import QRCode from 'react-native-qrcode-svg'

const profile = () => {
    // Auth store
    const childId = useAuthStore((state) => state.username);
    const logout = useAuthStore((state) => state.logout);

    // Use states
    const [showQr, setShowQr] = useState(false);
    const [linkToken, setLinkToken] = useState("");
    const [expiresAt, setExpiresAt] = useState();

    // Create token
    const createToken = async () => {
        try {
            const res = await fetch("http://10.0.0.99:5001/api/linkTokens/generate-link-token",{
                method: 'POST',
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({childId})
            });

            const data = await res.json();

            if (res.ok) {
                setLinkToken(data.token);
                setExpiresAt(data.expiresAt);
            } else {
                console.log(data.error);
            }
        } catch (error) {
            console.log("Error fetching token");
        }
    }

    const qrValue = linkToken;

    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center justify-center'>
                <TouchableOpacity 
                    className='flex justify-center items-center w-5/6 h-20 rounded-3xl bg-primary-two'
                    onPress={() => {setShowQr(true); createToken()}}
                >
                    <Text className='font-staatliches text-2xl'>Show QR</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className='flex items-center justify-center bg-primary w-5/6 h-20 rounded-3xl mt-2'
                    onPress={() => {logout(); router.replace('/(auth)/login')}}
                >
                    <Text className='font-staatliches text-2xl'>Log out</Text>
                </TouchableOpacity>
            </View>
            {/* QR code */}
            <Modal 
                visible={showQr}
                transparent
                animationType='fade'
            >
                <View className='flex justify-center items-center w-full h-full'>
                    <View className='w-[90%] h-1/2 bg-slate-500 p-2 rounded-2xl'>
                        <View className='flex-row justify-between w-full'>
                            <Text className='font-staatliches text-3xl text-secondary'>QR Code</Text>
                            <TouchableOpacity onPress={() => setShowQr(false)}>
                                <Image source={require('@/assets/icons/cross.png')} className='w-6 h-6' resizeMode='contain' style={{tintColor:'#0B0C15'}}/>
                            </TouchableOpacity>
                        </View>
                        <Text className='font-staatliches text-xl text-slate-200'>Scan this code in the parent app</Text>
                        <View className='flex-1 w-full justify-center items-center'>
                            <View className='justify-center items-center w-[230] h-[230] bg-slate-300 rounded-2xl'>
                                {linkToken && <QRCode value={qrValue} size={200} backgroundColor='#CBD5E1'/>}
                            </View>
                            <View className='w-[230]'>
                                <Text className='font-oswald-extralight text-center'>
                                    Your QR code is private. If you share it with someone, they can scan it on their ChildWay camera to add you as a child.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default profile