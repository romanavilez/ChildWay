import { View, Text, TextInput, TouchableOpacity, Image, Alert, FlatList, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox, {Camera, LocationPuck, MapView} from '@rnmapbox/maps'
import {requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObjectCoords} from 'expo-location'
import { v4 as uuidv4} from 'uuid'
import 'react-native-get-random-values'

import RadioButton from '@/components/RadioButton'

import '../global.css'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

type suggestPlacesProps = {
    query: string
    longitude: number
    latitude: number
    navProfile: string
}

type mapboxSuggestion = {
    name: string
    eta: number
    address: string
}

const Index = () => {
    const [travelMode, setTravelMode] = useState('');
    const [location, setLocation] = useState<LocationObjectCoords | null>(null);
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<mapboxSuggestion[]>([]);
    const [destination, setDestination] = useState("");

    // Ask user for location permission
    useEffect(() => {
        (async () => {
            const {status} = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location Permission Denied!');
            }
        })();
    }, []);

    // Render suggestions only when useState is updated
    useEffect(() => {
        for (let suggestion of suggestions) {
            console.log(suggestion);
        }
    }, [suggestions])
    
    // Set travel mode only if it is different than the current
    const handleModeSelection = (value: string) =>{
        if (travelMode === value) {
            setTravelMode('');
        } else {
            setTravelMode(value);
        }
    }

    const handleDestinationSelection = (address: string) => {
        setDestination(address);
        setSuggestions([]);
        setSearch(address);
    }
    
    // Get user's coordinates
    const getLocation = async () => {
        let loc = await getCurrentPositionAsync({});
        setLocation(loc.coords);
    }

    // Return 5 of the closest locations to user, matching the query
    const suggestPlaces = async ({query, longitude, latitude, navProfile} : suggestPlacesProps) => {
        if (!query) return [];

        if (navProfile === '') Alert.alert("Travel Mode Not Specified", "Please select a travel mode.");

        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const sessionToken = uuidv4();

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}` + 
                    `&access_token=${accessToken}` + 
                    `&session_token=${sessionToken}` + 
                    `&proximity=${longitude},${latitude}` + 
                    `&eta_type=navigation` + 
                    `&navigation_profile=${navProfile}` + 
                    `&origin=${longitude},${latitude}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            let suggestions: mapboxSuggestion[] = []
            for (let suggestion of data.suggestions) {
                if (suggestion.name && suggestion.eta && suggestion.full_address) {
                    suggestions.push({name: suggestion.name, eta: suggestion.eta, address: suggestion.full_address});
                }
            }
            suggestions.sort((a, b) => a.eta - b.eta);
            setSuggestions(suggestions);
        } catch (error) {
            console.log("Error suggesting places: ", error);
        }
    }

    // Opens Google Maps and navigates user to destination with specified travel mode
    const openGoogleMaps = async () => {
        const url = `https://www.google.com/maps/dir/?api=1` +
                    `&origin=${location?.latitude},${location?.longitude}` +
                    `&destination=${encodeURIComponent(destination)}` +
                    `&travelmode=${travelMode === 'cycling' ? 'bicycling' : `${travelMode}`}` +
                    `&dir_action=navigate`;

        try {
            Linking.openURL(url);
        } catch (error) {
            console.log("Error opening Google Maps: ", error);
        }
    }

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl text-white pt-3 w-full text-center'>Map</Text>
                <View className='w-full relative'>
                    <View className={`rounded-2xl bg-primary ${destination ? 'h-20' : 'h-14'} w-full flex justify-center pl-2 pr-8`}>
                        <TextInput 
                            className={`color-white ${destination ? 'h-28' : 'h-14'} w-full font-staatliches text-xl`} 
                            placeholder='Where are you heading?'
                            textAlign='center'
                            value={search}
                            onChangeText={(text) => setSearch(text)}
                            onFocus={getLocation}
                            onSubmitEditing={(event) => {
                                const query = event.nativeEvent.text;
                                if (location) {
                                    suggestPlaces({query, longitude: location.longitude, latitude: location.latitude, navProfile: travelMode});
                                } else {
                                    console.log("Location not available");
                                }
                            }}
                            returnKeyType='done'
                            multiline={destination ? true : false}
                            numberOfLines={2}
                        />
                        <TouchableOpacity className='absolute end-3' onPress={() => {
                                setSearch('');
                                setSuggestions([]);
                                setDestination("");
                            }}
                        >
                            <Image source={require('@/assets/icons/cross.png')} resizeMode='contain' className='h-5 w-5'/>
                        </TouchableOpacity>
                    </View>
                    {suggestions.length > 0 && (
                        <View className='w-full absolute z-10 top-14 rounded-lg bg-slate-800'>
                            <FlatList
                                data={suggestions}
                                renderItem={({item}) => (
                                    <TouchableOpacity className='h-15 pl-2' onPress={() => handleDestinationSelection(item.address)}>
                                        <View className='absolute left-1 top-2 bottom-1 bg-primary w-[2]'/>
                                        <View className='flex-row justify-between'>
                                            <View className='flex-1'>
                                                <Text className='text-white font-oswald-medium'>{item.name.toUpperCase()}</Text>
                                            </View>
                                            <Text className='text-white font-oswald-medium'>ETA: {item.eta.toFixed(0)}min</Text>
                                        </View>
                                        <Text className='text-white font-oswald-light'>{item.address}</Text>
                                    </TouchableOpacity>
                                )}
                            ></FlatList>
                        </View>
                    )}
                </View>
                <View className='radio-buttons flex-row justify-between w-full'>
                    <RadioButton 
                        value='walking' 
                        label='walking'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                    />
                    <RadioButton 
                        value='cycling'
                        label='cycling'
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
                <View className='w-full flex-1 rounded-2xl mb-2 overflow-hidden'> 
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true }}/>
                    </MapView>
                </View>
                {destination && (
                    <TouchableOpacity className='h-14 w-full items-center justify-center rounded-xl bg-tertiary' onPress={openGoogleMaps}>
                        <Text className='text-white font-staatliches text-2xl'>Take Me</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    )

    // colors={['#F54B64', '#F78361']}
}

export default Index;