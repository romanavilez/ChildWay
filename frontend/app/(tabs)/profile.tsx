import { View, Text, TouchableOpacity, Modal } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Models } from '@rnmapbox/maps';

const profile = () => {
    const [loginVisible, setLoginVisible] = useState(false);

    return (
        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl color-white'>Profile</Text>
                <View className='w-full flex-1 rounded-2xl bg-gray-200 mb-2'> 
                    <TouchableOpacity 
                        className='flex justify-center w-full h-20 bg-primary rounded-xl'
                        onPress={() => setLoginVisible(true)}
                    >
                        <Text className='text-center font-staatliches text-white text-xl'>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                visible={loginVisible}
                transparent
                animationType='fade'
            >
                <SafeAreaView edges={['top']} className='flex-1 bg-secondary'>
                    <TouchableOpacity className='w-full h-20 bg-tertiary' onPress={() => setLoginVisible(false)}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

export default profile