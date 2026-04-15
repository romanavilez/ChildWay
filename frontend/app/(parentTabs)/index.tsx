import { View, Text } from 'react-native'
import React, {useEffect, useState, useCallback} from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Mapbox, {Camera, MapView, LocationPuck} from '@rnmapbox/maps';

import { getSocket } from '@/services/socket';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function index() {
    // Use states
    const [children, setChildren] = useState(["ravilez", "bjr"]);
    const [childLocations, setChildLocations] = useState({});

    // useFocusEffect(
    //     useCallback(() => {
    //         const socket = getSocket();
    //         if (!socket) return;

    //         const handleConnect = () => {
    //             console.log("Socket id:", socket.id);
    //             for (const child of children) {
    //                 console.log("joining child:", child)
    //                 socket.emit("join_child", child);
    //             }
    //         }

    //         if (socket.connected) handleConnect();
    //         else socket.once("connect", handleConnect);

    //         return () => {
    //             for (const child of children) {
    //                 console.log("leaving child:", child);
    //                 socket.emit("leave_child", child);
    //             }
    //         }
    //     }, [children])
    // );

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