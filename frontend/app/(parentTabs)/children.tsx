import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Mapbox, {MapView, Camera, LocationPuck} from '@rnmapbox/maps'
import ChildCard from '@/components/ChildCard'

export default function children() {
    const [scrollEnabled, setScrollEnabled] = useState(true);

    return (
        <View className='flex-1 bg-secondary p-2'>
            <ScrollView scrollEnabled={scrollEnabled} className='flex bg-secondary-two rounded-2xl p-2'>
                <ChildCard name='Roman' distance={1.4} status='Walking' longitude={-122.18593431346928} latitude={47.76900787464037} setScroll={setScrollEnabled}/>
                <ChildCard name='Bobby' distance={2.3} status='At school' longitude={-122.19088786842046} latitude={47.758598857794226} setScroll={setScrollEnabled}/>
            </ScrollView>
        </View>
    )
}