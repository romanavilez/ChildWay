import { View, Text, FlatList, Image } from 'react-native'
import React, {useEffect, useState, useCallback} from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Mapbox, {Camera, MapView, LocationPuck, MarkerView} from '@rnmapbox/maps';

import { getSocket } from '@/services/socket';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function index() {
    // types
    type ChildLocation = {
        lat: number
        lng: number
    }
    type LocationUpdateProps = {
        childId: string
        latitude: number
        longitude: number
    }

    // Use states
    const [children, setChildren] = useState(["ravilez", "bjr"]);
    const [childLocations, setChildLocations] = useState<Record<string, ChildLocation>>({});


    useFocusEffect(
        useCallback(() => {
            // Grab socket
            const socket = getSocket();
            if (!socket) return;
            // On connection, join each child's room
            const handleConnect = () => {
                console.log("Socket id:", socket.id);
                for (const child of children) {
                    console.log("joining child:", child)
                    socket.emit("join_child", child);
                    socket.emit("start_sending_location", child);
                }
            }
            // handle connection when socket connects
            if (socket.connected) handleConnect();
            else socket.once("connect", handleConnect);
            // Append new child and location or update location
            const handleLocationUpdate = (data:LocationUpdateProps) => {
                console.log("handle location update");
                setChildLocations(prev => ({
                    ...prev,
                    [data.childId] : {lng:data.longitude, lat:data.latitude}
                }));
            }
            socket.on("location_update", handleLocationUpdate);

            // leave all rooms and turn off existing sockets
            return () => {
                for (const child of children) {
                    socket.emit("stop_sending_location", child);
                    console.log("leaving child:", child);
                    socket.emit("leave_child", child);
                }
                socket.off("location_update", handleLocationUpdate);
            }
        }, [children])
    );

    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center'>
                <View className='w-full flex-1 rounded-2xl overflow-hidden my-2'>
                    <MapView style={{flex: 1}}>
                        <Camera followUserLocation followZoomLevel={13}/>
                        <LocationPuck puckBearingEnabled puckBearing='heading' pulsing={{isEnabled:true}}/>
                        {children.map((item) => {
                            let location = childLocations[item];
                            if (!location) return null;
                            return (
                                <MarkerView key={item} coordinate={[location.lng, location.lat]} anchor={{x:0.5, y:1}} allowOverlap={true} allowOverlapWithPuck={true}>
                                    <View className='flex items-center'>
                                        <Text className='font-staatliches'>{item}</Text>
                                        <Image source={require('@/assets/icons/map-marker-smile.png')} style={{width: 30, height: 30}} resizeMode='contain'/>
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