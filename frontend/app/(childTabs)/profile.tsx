import { View, Text, TouchableOpacity, Modal, Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'
import QRCode from 'react-native-qrcode-svg'
import ProfilePicture from '@/components/ProfilePicture'
import ProfileField from '@/components/ProfileField'
import * as SecureStore from 'expo-secure-store'

const profile = () => {
    // Auth store
    const childId = useAuthStore((state) => state.username);
    const logout = useAuthStore((state) => state.logout);
    const name = useAuthStore((state) => state.name);
    const email = useAuthStore((state) => state.email);
    const role = useAuthStore((state) => state.userType);

    // Use states
    const [showQr, setShowQr] = useState(false);
    const [linkToken, setLinkToken] = useState("");
    const [expiresAt, setExpiresAt] = useState();

    // logout
    const closeSession = async () => {
        // update auth state
        logout(); 
        // delete auth tokens
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        // navigate to login
        router.replace('/(auth)/login')
    }

    // Create token
    const createToken = async () => {
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/linkTokens/generate-link-token`,{
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
        <View className='flex-1 items-center justify-center bg-secondary'>
            <ProfilePicture color='#10E5B2'/>
            {/* Personal details */}
            <Text className='flex self-start font-staatliches text-slate-300 ml-5 text-xl'>Personal Details</Text>
            <View className='flex items-center w-full'>
                <ProfileField type='name' value={name!} color='#10E5B2'/>
                <ProfileField type='username' value={childId!} color='#10E5B2'/>
                <ProfileField type='email' value={email!} color='#10E5B2'/>
                <ProfileField type='role' value={role!} color='#10E5B2'/>
            </View>
            <View className='flex justify-center w-[90%] mt-5'>
                <View className='text-left w-[90%]'>
                    <Text className='font-staatliches text-slate-300 text-xl'>Connect with your parent</Text>
                </View>
                {/* Show qr code */}
                <TouchableOpacity 
                    className='flex-row items-center w-40 gap-2'
                    onPress={() => {setShowQr(true); createToken()}}
                >
                    <Image source={require('@/assets/icons/camera.png')} resizeMode='contain' className='h-8 w-8' style={{tintColor: '#10E5B2'}}/>
                    <Text className='font-staatliches text-2xl text-primary'>Show QR</Text>
                </TouchableOpacity>
            </View>
            <View className='flex-1 mb-2 items-center justify-end w-full'>
                {/* Logout button */}
                <TouchableOpacity 
                    className='flex items-center justify-center bg-primary w-5/6 h-20 rounded-3xl mt-2'
                    onPress={() => {closeSession()}}
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
                <View className='flex justify-center items-center w-full h-full bg-secondary/80'>
                    <View className='w-[90%] h-1/2 bg-secondary-two p-2 rounded-2xl border-4 border-primary-two'>
                        <View className='flex-row justify-between w-full'>
                            <Text className='font-staatliches text-3xl text-primary-two'>QR Code</Text>
                            <TouchableOpacity onPress={() => setShowQr(false)} className='p-2'>
                                <Image source={require('@/assets/icons/cross.png')} className='w-6 h-6' resizeMode='contain' style={{tintColor:'#72F38E'}}/>
                            </TouchableOpacity>
                        </View>
                        <Text className='font-staatliches text-xl text-slate-300'>Scan this code in the parent app</Text>
                        <View className='flex-1 w-full justify-center items-center'>
                            <View className='justify-center items-center w-[230] h-[230] bg-slate-300 rounded-2xl'>
                                {linkToken && <QRCode value={qrValue} size={200} backgroundColor='#CBD5E1'/>}
                            </View>
                            <View className='w-[230]'>
                                <Text className='font-oswald-extralight text-center text-slate-300'>
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