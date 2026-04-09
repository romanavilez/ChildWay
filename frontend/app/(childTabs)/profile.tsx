import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'

const profile = () => {
    return (
        <View className='flex-1 bg-secondary'>
            <View className='flex flex-1 px-2 items-center justify-center'>
                <TouchableOpacity 
                    className='flex items-center justify-center bg-primary w-5/6 h-20 rounded-3xl'
                    onPress={() => router.replace('/(parentTabs)')}
                >
                    <Text className='font-staatliches text-2xl'>Parent View</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default profile