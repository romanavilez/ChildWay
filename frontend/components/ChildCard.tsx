import { View, Text, ScrollView, Image, FlatList } from 'react-native'
import React from 'react'
import { MapView, Camera, MarkerView, Images } from '@rnmapbox/maps'


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
        <View className='w-full rounded-2xl p-3 bg-slate-800 mb-4'>
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
        </View>
    )
}