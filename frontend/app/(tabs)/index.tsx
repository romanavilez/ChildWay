import { View, Text, TextInput } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox, {Camera, LocationPuck, MapView} from '@rnmapbox/maps'

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
        <SafeAreaView edges={['top']} className='flex-1'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl'>Map</Text>
                <View className='w-full flex-1 rounded-2xl bg-gray-200 mb-2 p-2'> 
                    <MapView style={{flex: 1, borderRadius: 5}}>
                        <Camera followUserLocation followZoomLevel={15}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }}/>
                    </MapView>
                </View>
                <TextInput 
                    className='rounded-2xl border-[2px] border-dashed border-gray-200 w-full mb-2' 
                    placeholder='Where are you heading?'
                    textAlign='center'
                />
            </View>
        </SafeAreaView>
    )
}

export default Index;