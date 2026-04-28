import { View, Text, TouchableOpacity, Modal, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'
import { Camera, CameraView, BarcodeScanningResult} from 'expo-camera'

export default function profile() {
    // Auth store
    const logout = useAuthStore((state) => state.logout);
    const parentId = useAuthStore((state) => state.username);

    // Use states
    const [scannerVisible, setScannerVisible] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<Boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    // Ask for camera permission
    useEffect(() => {
        if (!scannerVisible) return;

        (async () => {
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        })();
    }, [scannerVisible])

    const handleBarcodeScanned = async ({data:tokenId}:BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);

        // Verify token exists
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/linkTokens/verify-link-token`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({tokenId})
        })

        const data = await res.json();

        if (data.success) {
            const childId = data.childId;
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/pair-child`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({parentId, childId})
            })

            if (res.ok) console.log("Link successful");
        }
    }

    const handleClose = () => {
        setScannerVisible(false);
        setScanned(false);
    }

    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center justify-center'>
                <TouchableOpacity 
                    className='flex justify-center items-center w-5/6 h-20 rounded-3xl bg-tertiary-two'
                    onPress={() => setScannerVisible(true)}
                >
                    <Text className='font-staatliches text-2xl'>Scan QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className='flex items-center justify-center bg-tertiary w-5/6 h-20 rounded-3xl mt-2'
                    onPress={() => {logout(); router.replace('/(auth)/login')}}
                >
                    <Text className='font-staatliches text-2xl'>Log out</Text>
                </TouchableOpacity>
            </View>
            {/* QR code scanner */}
            <Modal 
                visible={scannerVisible}
                transparent
                animationType='fade'
            >
                <View className='flex justify-center items-center w-full h-full'>
                    <View className='w-[90%] h-1/2 bg-secondary-two p-2 rounded-2xl border-4 border-tertiary-two' style={{overflow:'hidden'}}>
                        <View className='flex-row justify-between w-full'>
                            <Text className='font-staatliches text-3xl text-tertiary-two'>Scan Code</Text>
                            <TouchableOpacity className="p-2" onPress={handleClose}>
                                <Image source={require('@/assets/icons/cross.png')} className='w-6 h-6' resizeMode='contain' style={{tintColor:'#FE9A3D'}}/>
                            </TouchableOpacity>
                        </View>
                        <Text className='font-staatliches text-xl text-slate-200'>Scan code from child app to link child</Text>
                        <View className='flex-1 w-full rounded-2xl overflow-hidden'>
                            {hasCameraPermission && (
                                <CameraView
                                    ratio='1:1'
                                    style={{flex:1, width:'100%'}}
                                    facing='back'
                                    barcodeScannerSettings={{barcodeTypes:['qr']}}
                                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}