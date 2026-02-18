import { View, Text, TextInput } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox, {Camera, LocationPuck, MapView} from '@rnmapbox/maps'
import {LinearGradient} from 'expo-linear-gradient'

import {requestForegroundPermissionsAsync} from 'expo-location'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

import '../global.css'

const Index = () => {
    // Ask user for location permission
    useEffect(() => {
        (async () => {
            const {status} = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location Permission Denied!')
            }
        })();
    }, []);

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl color-white pt-2'>Map</Text>
                <View className='w-full flex-1 rounded-2xl bg-gray-700 mb-2 overflow-hidden'> 
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={15}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }}/>
                    </MapView>
                </View>
                <TextInput 
                    className='rounded-2xl bg-primary color-white w-full mb-2 font-staatliches text-lg' 
                    placeholder='Where are you heading?'
                    textAlign='center'
                    textAlignVertical='center'
                />
            </View>
        </SafeAreaView>
    )

    // colors={['#F54B64', '#F78361']}
}

export default Index;