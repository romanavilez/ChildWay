import { View, Text, FlatList, Image } from 'react-native'
import React, {useEffect, useState, useCallback} from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Mapbox, {Camera, MapView, LocationPuck, MarkerView} from '@rnmapbox/maps';
import { useAuthStore } from '@/store/auth.store';

import { getSocket } from '@/services/socket';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function index() {
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
    type childrenProps = {
        childId: string,
        profilePic: string
    }

    // Use states
    const [children, setChildren] = useState<childrenProps[]>([]);
    const [childLocations, setChildLocations] = useState<Record<string, ChildLocation>>({});

    // Variables
    const socket = getSocket();
    const parentId = useAuthStore((state) => state.username);

    useFocusEffect(
        useCallback(() => {
            // Grab socket
            if (!socket || !parentId) return;

            // Initialize children
            const getAllChildren = async () => {
                try {
                    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/parentChildren/get-all-children/${parentId}`, {
                        method: "GET",
                        headers: {"Content-Type" : "application/json"}
                    });
            
                    const data = await res.json();
            
                    if (res.ok) {
                        setChildren(data.res);
                    } else {
                        console.log("Error getting children:", data.error);
                    }
                } catch (error) {
                    console.log("Error getting children:", error);
                }
            }
            getAllChildren();
            
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
        }, [socket, parentId])
    );

    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center'>
                <View className='w-full flex-1 rounded-2xl overflow-hidden my-2'>
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{isEnabled:true}}/>
                        {children.map((item) => {
                            let location = childLocations[item.childId];
                            if (!location) return null;
                            return (
                                <MarkerView key={item.childId} coordinate={[location.lng, location.lat]} anchor={{x:0.5, y:1}} allowOverlap={true} allowOverlapWithPuck={true}>
                                    <View className='flex items-center'>
                                        {item.profilePic ? (
                                            <View className='relative flex justify-center items-center h-[65px] w-[65px] rounded-3xl bg-white mb-2'>
                                                <View className='flex justify-center items-center h-[55px] w-[55px] rounded-3xl overflow-hidden'>
                                                    <Image source={{uri:item.profilePic}} resizeMode='contain' className='h-[55px] w-[55px]'/>
                                                </View>
                                                <View className='absolute -bottom-2 left-[37%] h-5 w-5 rotate-45 rounded-md bg-white -z-10'/>
                                            </View>
                                        ) : (
                                            <View className='flex items-center'>
                                                <Text className='font-staatliches'>{item.childId}</Text>
                                                <Image source={require('@/assets/icons/map-marker-smile.png')} style={{width: 30, height: 30}} resizeMode='contain'/>
                                            </View>
                                        )}
                                    </View>
                                </MarkerView>
                            )
                        })}
                    </MapView>
                </View>
            </View>
        </View>
    )
}