import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import ChildCard from '@/components/ChildCard'
import { getSocket } from '@/services/socket'
import { useFocusEffect } from '@react-navigation/native'
import * as Location from 'expo-location'

export default function children() {
    // types
    type ChildLocation = {
        lat: number
        lng: number
        speed: number
    }
    type LocationUpdateProps = {
        childId: string
        lat: number
        lng: number
        speed: number
    }

    // use states
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [children, setChildren] = useState(["ravilez", "bjr"]);
    const [childLocations, setChildLocations] = useState<Record<string, ChildLocation>>({});
    const [parentLocation, setParentLocation] = useState<{lat: number, lng: number} | null>(null)    
    // calculate shortest distance between two points on a sphere
    const haversine = (lat1:number, lng1:number, lat2:number, lng2:number) => {
        // distance between latitudes
        // and longitudes
        let dLat = (lat2 - lat1) * Math.PI / 180.0;
        let dLon = (lng2 - lng1) * Math.PI / 180.0;
        
        // convert to radiansa
        lat1 = (lat1) * Math.PI / 180.0;
        lat2 = (lat2) * Math.PI / 180.0;
        
        // apply formulae
        let a = Math.pow(Math.sin(dLat / 2), 2) + 
            Math.pow(Math.sin(dLon / 2), 2) * 
            Math.cos(lat1) * 
            Math.cos(lat2);
        let rad = 6371;
        let c = 2 * Math.asin(Math.sqrt(a));
        return (rad * c * 0.62137119).toFixed(2);
    }

    useFocusEffect(
        useCallback(() => {
            // Grab socket
            const socket = getSocket();
            if (!socket) return;
            
            // Append new child and location or update location
            const handleLocationUpdate = (data:LocationUpdateProps) => {
                setChildLocations(prev => ({
                    ...prev,
                    [data.childId] : {lng:data.lng, lat:data.lat, speed:data.speed}
                }));
            }
            socket.on("location_update", handleLocationUpdate);

            // leave all rooms and turn off existing sockets
            return () => {
                socket.off("location_update", handleLocationUpdate);
            }
        }, [children])
    );

    useEffect(() => {
        const getParentLocation = async () => {
            const parentLoc = await Location.getCurrentPositionAsync()
            setParentLocation({
                lat: parentLoc.coords.latitude,
                lng: parentLoc.coords.longitude
            })
        } 

        getParentLocation();
    }, [])
    

    return (
        <View className='flex-1 bg-secondary p-2'>
            <View className='flex bg-secondary-two rounded-2xl p-2'>
                <FlatList
                    data={children}
                    renderItem={({item}) => {
                        let location = childLocations[item];
                        return (
                            <ChildCard
                                name={item}
                                distance={parentLocation && location ? haversine(parentLocation.lat, parentLocation.lng, location.lat, location.lng) : "0"}
                                speed={
                                    location ? location?.speed <= 0.25 ? "0 mph" : `${(location?.speed * 2.2369363).toFixed(2)} mph` : 'N/A'
                                }
                                longitude={location?.lng || null}
                                latitude={location?.lat || null}
                                setScroll={setScrollEnabled}
                            />
                        )
                    }}
                    scrollEnabled={scrollEnabled}
                />
                {/* <ChildCard name='Roman' distance={1.4} status='Walking' longitude={-122.18593431346928} latitude={47.76900787464037} setScroll={setScrollEnabled}/>
                <ChildCard name='Bobby' distance={2.3} status='At school' longitude={-122.19088786842046} latitude={47.758598857794226} setScroll={setScrollEnabled}/> */}
            </View>
        </View>
    )
}