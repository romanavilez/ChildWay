import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import Mapbox, {MapView, Camera, LocationPuck} from '@rnmapbox/maps'
import ChildCard from '@/components/ChildCard'
import { getSocket } from '@/services/socket'
import { useFocusEffect } from '@react-navigation/native'

export default function children() {
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

    // use states
    const [scrollEnabled, setScrollEnabled] = useState(true);
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

    useEffect(() => {
        console.log("child locations:", childLocations);
    }, [childLocations])
    

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
                                distance={Math.random() * 3}
                                status='Stationary'
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