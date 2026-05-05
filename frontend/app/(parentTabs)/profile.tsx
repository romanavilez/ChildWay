import { View, Text, TouchableOpacity, Modal, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'
import { Camera, CameraView, BarcodeScanningResult} from 'expo-camera'
import * as Notifications from "expo-notifications"

export default function profile() {
    // Auth store
    const logout = useAuthStore((state) => state.logout);
    const parentId = useAuthStore((state) => state.username);

    // Use states
    const [scannerVisible, setScannerVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [childId, setChildId] = useState<string | null>(null);
    const [scanned, setScanned] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<Boolean | null>(null);

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

        // On verification show pairing confirmation
        const data = await res.json();
        if (data.success) {
            setScannerVisible(false);
            setChildId(data.childId);
            setConfirmationVisible(true);
        }
    }

    const handlePairConfirmation = async () => {
        if (!childId) console.log("Failed scanning qr code");
        // Pair child with parent
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/pair-child`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({parentId, childId})
        })
        // confirm pairing was successful
        const data = await res.json();
        if (data.success) {
            console.log("Paired successfully");
        } else if (res.status === 409) {
            Alert.alert("Child already added", data.error)
        } else {
            Alert.alert("Pairing failed", `Could not add ${childId} to your account`);
        }

        handleConfirmationClose();
    }

    const handleScannerClose = () => {
        setScannerVisible(false);
        setScanned(false);
    }

    const handleConfirmationClose = () => {
        setConfirmationVisible(false);
        setChildId(null);
        setScanned(false);
    }

    const sendNotification = async () => {
        try {
            const title = "Test Message";
            const body = "This message is being sent to ravilez";
            const data = {type: "test"}
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/pushTokens/send-message/ravilez`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({title, body, data})
            });
    
            if (res.ok) console.log("message sent");
        } catch (error) {
            console.log("Couldn't send notification:", error);
        }
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
                <TouchableOpacity 
                    className='flex items-center justify-center bg-white w-5/6 h-20 rounded-3xl mt-2'
                    onPress={sendNotification}
                >
                    <Text className='font-staatliches text-2xl'>Send Notification</Text>
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
                            <TouchableOpacity className="p-2" onPress={handleScannerClose}>
                                <Image source={require('@/assets/icons/cross.png')} className='w-6 h-6' resizeMode='contain' style={{tintColor:'#FE9A3D'}}/>
                            </TouchableOpacity>
                        </View>
                        <Text className='font-staatliches text-xl text-slate-300'>Scan code from child app to link child</Text>
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
            {/* Pairing confirmation */}
            <Modal
                visible={confirmationVisible}
                transparent
                animationType='fade'
            >
                <View className='flex h-full w-full justify-center items-center'>
                    <View className='flex justify-center w-[90%] h-[30%] bg-secondary-two p-2 rounded-2xl border-4 border-white'>
                        <View className='flex justify-center items-center'>
                            <Text className='font-staatliches text-white text-3xl'>Confirm child connection</Text>
                            <Text className='font-staatliches text-slate-300 text-xl'>Do you want to add <Text className='underline text-primary'>{childId}</Text> to your account?</Text>
                        </View>
                        <View className='flex-row w-full justify-center mt-10 gap-2'>
                            <TouchableOpacity className='rounded-xl p-2 bg-tertiary w-1/4' onPress={handleConfirmationClose}>
                                <Text className='font-staatliches text-white text-xl text-center'>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className='rounded-xl p-2 bg-primary w-1/4' onPress={handlePairConfirmation}>
                                <Text className='font-staatliches text-white text-xl text-center'>Add child</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}