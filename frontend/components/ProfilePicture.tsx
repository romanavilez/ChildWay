import { Alert, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '@/store/auth.store'
import profile from '@/app/(parentTabs)/profile'

const ProfilePicture = () => {
    // grab user
    const userId = useAuthStore((state) => state.username);

    // use states
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // Get permission to access media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            storeProfilePic(imageUri);
        }
    }

    const storeProfilePic = async (profilePic: string) => {
        // create FormData and append profile pic and userId
        const formData = new FormData();
        formData.append('image', {
            uri: profilePic,
            type: 'image/jpeg',
            name: 'profile.jpg'
        } as any);
        formData.append('userId', userId as any);

        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/users/update-profile-pic`, {
            method: "POST", 
            headers: {"Content-Type" : "multipart/form-data"},
            body: formData
        })

        const data = await res.json();

        if (res.ok) {
            setImage(data.imageUrl);
        } else {
            console.log("Error storing profile pic:", data.error);
        }
    }

    const getProfilePic = async () => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/users/profile-pic/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        });

        const data = await res.json();

        if (res.ok) {
            if (data.success) {
                setImage(data.profilePic);
            }
        } else {
            console.log("Error getting profile pic:", data.error);
        }
    }

    useEffect(() => {
        getProfilePic();
    }, []);

    return (
        <View className='flex items-center justify-center mt-20'>
            <View className='relative flex items-center justify-center rounded-3xl w-40 h-40 bg-white'>
                <View className='flex justify-center items-center rounded-3xl w-40 h-40 overflow-hidden border-2 border-white'>
                    {image ? (
                        <Image source={{uri: image}} resizeMode='contain' className='w-40 h-40'/>
                    ) : (
                        <Image source={require('@/assets/icons/user.png')} resizeMode='contain' className='w-24 h-24' style={{tintColor:"#334155"}}/>
                    )}
                </View>
                <TouchableOpacity 
                    className='absolute -right-2 bottom-0 flex justify-center items-center bg-slate-700 rounded-full w-8 h-8'
                    onPress={pickImage}
                >
                    <Image 
                        source={require("@/assets/icons/pencil.png")} 
                        resizeMode='contain' 
                        className='w-5 h-5' 
                        style={{tintColor: 'white'}}
                    />
                </TouchableOpacity>
            </View>
            <Text className='text-white font-staatliches mt-2 text-lg'>{userId}</Text>
        </View>
    )
}

export default ProfilePicture