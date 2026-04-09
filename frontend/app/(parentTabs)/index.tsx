import { View, Text } from 'react-native'
import React, {useEffect} from 'react'
import { requestForegroundPermissionsAsync } from 'expo-location';
import Mapbox, {Camera, MapView, LocationPuck} from '@rnmapbox/maps'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function index() {
    // Ask user for location permission
    useEffect(() => {
        (async () => {
            const {status} = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location Permission Denied!');
            }
        })();
    }, []);

    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center'>
                <View className='w-full flex-1 rounded-2xl overflow-hidden my-2'>
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{isEnabled:true}}/>
                    </MapView>
                </View>
            </View>
        </View>
    )
}