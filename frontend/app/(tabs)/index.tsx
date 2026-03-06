import { View, Text, TextInput, TouchableOpacity, Image, Alert, FlatList, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox, {Camera, LineLayer, LocationPuck, MapView, ShapeSource, MarkerView, Images} from '@rnmapbox/maps'
import {requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObjectCoords} from 'expo-location'
import {LinearGradient} from 'expo-linear-gradient'
import { v4 as uuidv4} from 'uuid'
import 'react-native-get-random-values'
import {Feature, LineString} from "geojson"

import RadioButton from '@/components/RadioButton'

import '../global.css'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

// Prop types
type suggestPlacesProps = {
    query: string
    longitude: number
    latitude: number
    navProfile: string
}

type mapboxSuggestion = {
    mapboxId: string
    sessionToken: string
    name: string
    eta: number
    address: string
}

const Index = () => {
    // Use States
    const [travelMode, setTravelMode] = useState('');
    const [location, setLocation] = useState<LocationObjectCoords | null>(null);
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<mapboxSuggestion[]>([]);
    const [destination, setDestination] = useState("");
    const [destCoordinates, setDestCoordinates] = useState<LocationObjectCoords | null>(null);
    const [route, setRoute] = useState<any>(null);

    // Ask user for location permission
    useEffect(() => {
        (async () => {
            const {status} = await requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location Permission Denied!');
            }
        })();
    }, []);

    // Get route only when destination coordinates are available
    useEffect(() => {
        if(!destCoordinates) return;
        getRoute();
    }, [destCoordinates]);
    
    // Set travel mode only if it is different than the current
    const handleModeSelection = (value: string) =>{
        if (travelMode === value) {
            setTravelMode('');
        } else {
            setTravelMode(value);
        }
    }

    // Update relevant fields when destination is selected from suggestions
    const handleDestinationSelection = (address: string, mapboxId: string, sessionToken: string) => {
        setDestination(address);
        setSuggestions([]);
        setSearch(address);
        retrievePlace(mapboxId, sessionToken);
    }
    
    // Get user's coordinates
    const getLocation = async () => {
        let loc = await getCurrentPositionAsync({});
        setLocation(loc.coords);
    }

    // get an array of coordinates using Directions API, from user's location to destination
    const getRoute = async () => {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const url = `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/` +
                    `${location?.longitude},${location?.latitude};${destCoordinates?.longitude},${destCoordinates?.latitude}/?` +
                    `access_token=${accessToken}` +
                    `&geometries=geojson`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            setRoute(data.routes[0].geometry);
        } catch (error) {
            console.log("Error getting directions: ", error);
        }
    }

    // Return 5 of the closest locations to user that match the query
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
                    suggestions.push({mapboxId: suggestion.mapbox_id, 
                                    sessionToken, 
                                    name: suggestion.name, 
                                    eta: suggestion.eta, 
                                    address: suggestion.full_address}
                    );
                }
            }
            suggestions.sort((a, b) => a.eta - b.eta);
            setSuggestions(suggestions);
        } catch (error) {
            console.log("Error suggesting places: ", error);
        }
    }

    // retrieve coordinates of place that was selected from the suggestions
    const retrievePlace = async (mapboxId: string, sessionToken: string) => {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?` +
                    `session_token=${sessionToken}` +
                    `&access_token=${accessToken}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            setDestCoordinates(data.features[0].properties.coordinates);
        } catch (error) {
            console.log("Error retrieving place: ", error);
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
        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl text-white w-full text-center'>Map</Text>
                {/* Search box */}
                <View className='w-full relative'>
                    <LinearGradient 
                        className={`rounded-2xl ${destination ? 'h-20' : 'h-14'} w-full flex justify-center pl-2 pr-8 overflow-hidden`}
                        colors={['#10E5B2', '#72f38e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
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
                                setRoute(null);
                                setDestCoordinates(null);
                            }}
                        >
                            <Image source={require('@/assets/icons/cross.png')} resizeMode='contain' className='h-5 w-5'/>
                        </TouchableOpacity>
                    </LinearGradient>
                    {/* Suggestions list - only render when search has been made */}
                    {suggestions.length > 0 && (
                        <View className='w-full absolute z-10 top-14 rounded-lg bg-slate-800'>
                            <FlatList
                                data={suggestions}
                                renderItem={({item}) => (
                                    <TouchableOpacity className='h-15 pl-2' onPress={() => handleDestinationSelection(item.address, item.mapboxId, item.sessionToken)}>
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
                {/* Travel mode options */}
                <View className='radio-buttons flex-row justify-between w-full gap-1'>
                    <RadioButton 
                        value='walking' 
                        label='walking'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                        color='#10E5B2'
                    />
                    <RadioButton 
                        value='cycling'
                        label='cycling'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                        color='#4fed9f'
                    />
                    <RadioButton 
                        value='driving'
                        label='driving'
                        travelMode={travelMode}
                        onValueChange={handleModeSelection}
                        color='#72f38e'
                    />
                </View>
                {/* Mapbox Map */}
                <View className='w-full flex-1 rounded-2xl mb-2 overflow-hidden'> 
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{ isEnabled: true, color: "#10E5B2" }} bearingImage='origin'/>
                        <Images
                            images={{
                                origin: require('@/assets/icons/origin.png'),
                            }}
                        />
                        {route && (
                            <ShapeSource id="routeSource" shape={{type: "Feature", geometry: route, properties: {}}} lineMetrics={true}>
                                <LineLayer 
                                    id="lineSource" 
                                    style={{
                                        lineColor: '#F78361',
                                        lineWidth: 3, 
                                        lineCap: 'round', 
                                        lineJoin: 'round'
                                    }}
                                />
                            </ShapeSource>
                        )}
                        {destCoordinates && (
                            <MarkerView coordinate={[destCoordinates.longitude, destCoordinates.latitude]}>
                                <Image source={require('@/assets/icons/destination.png')} className='h-8 w-8'/>
                            </MarkerView>
                        )}
                    </MapView>
                </View>
                {/* Google Maps navigation button - only render when destination is available */}
                {destination && (
                    <View className='w-full overflow-hidden rounded-xl'>
                        <LinearGradient 
                            className='w-full'
                            colors={['#F54B64', '#FE9A3D']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <TouchableOpacity className=' flex-row h-14 w-full items-center justify-center rounded-xl' onPress={openGoogleMaps}>
                                <Text className='text-white font-staatliches text-3xl'>Go </Text>
                                <Image source={require('@/assets/icons/arrow-circle-right.png')} resizeMode='contain' className='h-7 w-7'/>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}
            </View>
        </View>
    )
}

export default Index;