import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

export default function profile() {
    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center justify-center'>
                <TouchableOpacity 
                    className='flex items-center justify-center bg-tertiary w-5/6 h-20 rounded-3xl'
                    onPress={() => router.replace('/(childTabs)')}
                >
                    <Text className='font-staatliches text-2xl'>Child View</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}