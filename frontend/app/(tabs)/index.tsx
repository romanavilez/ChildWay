import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox, {Camera, LocationPuck, MapView} from '@rnmapbox/maps'
import {requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObjectCoords} from 'expo-location'
import { v4 as uuidv4} from 'uuid'
import 'react-native-get-random-values'

import RadioButton from '@/components/RadioButton'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

import '../global.css'
import { Float } from 'react-native/Libraries/Types/CodegenTypes'

type suggestPlacesProps = {
    query: string
    longitude: Float
    latitude: Float
}

const Index = () => {
    const [travelMode, setTravelMode] = useState('');
    const [location, setLocation] = useState<LocationObjectCoords | null>(null);
    const [suggestions, setSuggestions] = useState([]);

    // Ask user for location permission
    useEffect(() => {
        (async () => {
            const {status} = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location Permission Denied!');
            }
        })();
    }, []);
    
    // Set travel mode only if it is different than the current
    const handleModeSelection = (value: string) =>{
        if (travelMode === value) {
            setTravelMode('');
        } else {
            setTravelMode(value);
        }
    }
    
    // Get user's coordinates
    const getLocation = async () => {
        let loc = await getCurrentPositionAsync({});
        setLocation(loc.coords);
    }
    // Return 5 of the closest locations to user, matching the query
    const suggestPlaces = async ({query, longitude, latitude} : suggestPlacesProps) => {
        if (!query) return [];

        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const sessionToken = uuidv4();

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}` + 
                    `&access_token=${accessToken}` + 
                    `&session_token=${sessionToken}` + 
                    `&proximity=${longitude},${latitude}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            setSuggestions(data.suggestions);
            for (let suggestion of suggestions) {
                console.log(suggestion);
            }
        } catch (error) {
            console.log("Error suggesting places: ", error);
        }
    }

    const retrievePlace = () => {

    }

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl text-white pt-3 w-full text-center'>Map</Text>
                <TextInput 
                    className='rounded-2xl bg-primary color-white h-15 w-full mb-2 font-staatliches text-lg' 
                    placeholder='Where are you heading?'
                    textAlign='center'
                    onFocus={getLocation}
                    onSubmitEditing={(event) => {
                        const query = event.nativeEvent.text;
                        if (location) {
                            suggestPlaces({query, longitude: location.longitude, latitude: location.latitude});
                        } else {
                            console.log("Location not available");
                        }
                    }}
                    returnKeyType='done'
                />
                <View className='radio-buttons flex-row justify-between w-full'>
                    <RadioButton 
                        value='walking' 
                        label='walking'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                    />
                    <RadioButton 
                        value='bicycling'
                        label='bicycling'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                    />
                    <RadioButton 
                        value='driving'
                        label='driving'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                    />
                </View>
                <View className='w-full flex-1 rounded-2xl bg-gray-700 mb-2 overflow-hidden'> 
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }}/>
                    </MapView>
                </View>
            </View>
        </SafeAreaView>
    )

    // colors={['#F54B64', '#F78361']}
}

export default Index;