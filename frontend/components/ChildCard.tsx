import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { MapView, Camera, MarkerView, Images } from '@rnmapbox/maps'

type ChildCardProps = {
    name: string
    distance: string | null
    status: string
    longitude: number | null
    latitude: number | null
    setScroll: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ChildCard({name, distance, status, longitude, latitude, setScroll} : ChildCardProps) {
    return (
        <View className='w-full rounded-2xl p-3 bg-slate-800 mb-4'>
            {/* Child Info */}
            <View className='flex-row justify-between items-center'>
                <Text className='text-2xl color-white font-staatliches'>{name}</Text>
                <Text className='color-slate-300 font-staatliches'>Distance: {distance} mi</Text>
            </View>
            <Text className='color-primary-two font-staatliches'>Status: {status}</Text>
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
                            <Camera centerCoordinate={[longitude, latitude]} zoomLevel={13}/>
                            <MarkerView coordinate={[longitude, latitude]} anchor={{x:0.5, y:1}}>
                                <Image source={require('@/assets/icons/map-marker-smile.png')} style={{height: 30, width: 30}} resizeMode='contain'/>
                            </MarkerView>
                        </View>
                    )}
                </MapView>  
            </View>
            {/* Alerts */}
            <View className='h-36 rounded-2xl mt-2'>
                <Text className='text-xl color-tertiary font-staatliches'>Alerts</Text>
                <ScrollView persistentScrollbar={true} nestedScrollEnabled={true}>
                    <Text className='font-oswald-extralight color-white'>3:40 PM - Unusual route detected</Text>
                    <Text className='font-oswald-extralight color-white'>3:35 PM - Longer stop than usual</Text>
                    <Text className='font-oswald-extralight color-white'>3:30 PM - Left school</Text>
                    <Text className='font-oswald-extralight color-white'>1:20 PM - Battery low</Text>
                    <Text className='font-oswald-extralight color-white'>7:45 AM - Arrived at school</Text>
                    <Text className='font-oswald-extralight color-white'>7:30 AM - Left home</Text>
                </ScrollView>
            </View>
        </View>
    )
}