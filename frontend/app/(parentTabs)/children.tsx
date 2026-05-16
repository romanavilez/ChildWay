import { View, Text, ScrollView, FlatList } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import ChildCard from '@/components/ChildCard'
import { getSocket } from '@/services/socket'
import { useFocusEffect } from '@react-navigation/native'
import * as Location from 'expo-location'
import { useAuthStore } from '@/store/auth.store'

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
    type childrenProps = {
        childId: string, 
        profilePic: string
    }
    type alertProps = {
        time: string,
        alert_body: string
    }

    // variables
    const socket = getSocket();
    const parentId = useAuthStore((state) => state.username);

    // use states
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [children, setChildren] = useState<childrenProps[]>([]);
    const [childLocations, setChildLocations] = useState<Record<string, ChildLocation>>({});
    const [parentLocation, setParentLocation] = useState<{lat: number, lng: number} | null>(null);
    const [alerts, setAlerts] = useState<Map<string, alertProps[]>>(new Map());
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
            if (!socket || !parentId) return;
            
            // Initialize children
            const getAllChildren = async () => {
                try {
                    const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/get-all-children/${parentId}`, {
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

    useEffect(() => {
        if (!children) return;

        // Initialize alerts
        const getAllAlerts = async () => {
            try {
                const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/alerts/all-alerts/${parentId}`, {
                    method: "GET",
                    headers: {"Content-Type" : "application/json"}
                });

                const data = await res.json();

                if (res.ok) {
                    const alerts = data.alerts;
                    
                    setAlerts(() => {
                        let updated = new Map();

                        children.forEach((child: childrenProps) => {
                            const childAlerts = alerts.filter((alert: any) => {return alert.child_id === child.childId});
                            updated.set(child.childId, childAlerts);
                        });
                        
                        return updated;
                    })
                } else {
                    console.log("Failed to get alerts:", data.error);
                }
            } catch (error) {
                console.log("Failed to get alerts:", error);
            }
        }
        getAllAlerts();

    }, [children])
    

    return (
        <View className='flex-1 bg-secondary p-2'>
            <View className='flex bg-secondary-two rounded-2xl p-2'>
                <FlatList
                    data={children}
                    renderItem={({item}) => {
                        let location = childLocations[item.childId];
                        return (
                            <ChildCard
                                name={item.childId}
                                profilePic={item.profilePic}
                                distance={parentLocation && location ? haversine(parentLocation.lat, parentLocation.lng, location.lat, location.lng) : "0"}
                                speed={
                                    location ? location?.speed <= 0.25 ? "0 mph" : `${(location?.speed * 2.2369363).toFixed(2)} mph` : 'N/A'
                                }
                                longitude={location?.lng || null}
                                latitude={location?.lat || null}
                                alerts={alerts.get(item.childId) ?? []}
                                setScroll={setScrollEnabled}
                            />
                        )
                    }}
                    scrollEnabled={scrollEnabled}
                />
            </View>
        </View>
    )
}