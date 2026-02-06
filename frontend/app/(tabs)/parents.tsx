import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

const parents = () => {
    return (
        <SafeAreaView edges={['top']} className='flex-1'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl'>Parents</Text>
                <View className='w-full flex-1 rounded-2xl bg-gray-200 mb-2'>   
                </View>
            </View>
        </SafeAreaView>
    )
}

export default parents