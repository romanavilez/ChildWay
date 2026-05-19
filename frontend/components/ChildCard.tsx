import { View, Text, ScrollView, Image, FlatList, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import { MapView, Camera, MarkerView, Images } from '@rnmapbox/maps'
import { LinearGradient } from 'expo-linear-gradient'
import { getCurrentPositionAsync } from 'expo-location'

type alertProps = {
    time: string, 
    alert_body: string
}

type ChildCardProps = {
    name: string
    profilePic: string
    distance: string | null
    speed: string
    longitude: number | null
    latitude: number | null
    alerts: alertProps[]
    setScroll: React.Dispatch<React.SetStateAction<boolean>>
}


export default function ChildCard({name, profilePic, distance, speed, longitude, latitude, alerts, setScroll} : ChildCardProps) {
    // grab parent's location
    const getLocation = async () => {
        const loc = await getCurrentPositionAsync();
        return {parentLat: loc.coords.latitude, parentLng: loc.coords.longitude};
    }
    
    // Opens Google Maps and navigates user to destination with specified travel mode
    const navigateToChild = async () => {
        // Can't navigate without child's coordinates
        if (!longitude || !latitude) return;
        const {parentLat, parentLng} = await getLocation();
        const url = `https://www.google.com/maps/dir/?api=1` +
                    `&origin=${latitude},${longitude}` +
                    `&destination=${parentLat},${parentLng}`;

        try {
            Linking.openURL(url);
        } catch (error) {
            console.log("Error opening Google Maps: ", error);
        }
    }

    // Grab current time in 12 hour format
    const getCurrentTime = (timestamp: string) => {
        const time = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return time;
    }

    return (
        <View className='w-full rounded-2xl p-3 mb-4 border-[1px] border-white'>
            {/* Child Info */}
            <View className='flex-row justify-between items-center'>
                <Text className='text-2xl color-white font-staatliches'>{name}</Text>
                <Text className='color-slate-300 font-staatliches'>Distance: {distance} mi</Text>
            </View>
            <Text className='color-primary-two font-staatliches'>Speed: {speed}</Text>
            {/* Map */}
            <View className='h-52 rounded-2xl overflow-hidden'>
                <MapView style={{flex: 1}} onTouchStart={() => setScroll(false)} onTouchEnd={() => setScroll(true)}>
                    <Images
                        images={{
                            origin: require('@/assets/icons/origin.png')
                        }}
                    />
                    {longitude && latitude && (
                        <View>
                            <Camera centerCoordinate={[longitude, latitude + 0.002]} zoomLevel={13}/>
                            <MarkerView coordinate={[longitude, latitude]} anchor={{x:0.5, y:1}}>
                                <View className='flex items-center'>
                                    {profilePic ? (
                                        <View className='relative flex justify-center items-center h-[65px] w-[65px] rounded-3xl bg-white mb-2'>
                                            <View className='flex justify-center items-center h-[55px] w-[55px] rounded-3xl overflow-hidden'>
                                                <Image source={{uri:profilePic}} resizeMode='contain' className='h-[55px] w-[55px]'/>
                                            </View>
                                            <View className='absolute -bottom-2 left-[37%] h-5 w-5 rotate-45 rounded-md bg-white -z-10'/>
                                        </View>
                                    ) : (
                                        <View className='flex items-center'>
                                            <Image source={require('@/assets/icons/map-marker-smile.png')} style={{height: 30, width: 30}} resizeMode='contain'/>
                                        </View>
                                    )}
                                </View>
                            </MarkerView>
                        </View>
                    )}
                </MapView>  
            </View>
            {/* Alerts */}
            <View className='rounded-2xl mt-2'>
                <Text className='text-xl color-tertiary font-staatliches'>Alerts</Text>
                {!alerts.length ? (
                    <Text className='font-oswald-extralight text-white text-md'>No alerts</Text>
                ) : (
                    <ScrollView
                        style={{maxHeight: 84}}
                        scrollEnabled={alerts.length > 4}
                        nestedScrollEnabled={true}
                    >
                        {alerts.map((alert, index) => {
                            const time = getCurrentTime(alert.time);
                            return (
                                <Text key={index} className='font-oswald-extralight text-white text-md h-[21px]'>{time} - {alert.alert_body}</Text>
                            )
                        })}
                    </ScrollView>
                )}
            </View>
            {/* Navigation */}
            <TouchableOpacity className='flex-row w-full bg-secondary rounded-2xl h-10 mt-2' onPress={navigateToChild}>
                <LinearGradient 
                    className='flex-row justify-center items-center w-full h-10 gap-2'
                    style={{borderRadius: 16}}
                    colors={['#FF6F52', '#FE9A3D']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text className='font-staatliches text-white text-2xl'>Go</Text>
                    <Image source={require('@/assets/icons/arrow-circle-right.png')} resizeMode='contain' className='h-6 w-6'/>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}