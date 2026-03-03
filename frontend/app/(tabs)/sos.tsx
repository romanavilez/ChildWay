import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const sos = () => {
    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl color-white pt-3'>SOS</Text>
                <View className='w-full flex-1 rounded-2xl bg-[#12151D] mb-2 p-3'>
                    <TouchableOpacity className='flex justify-center items-center h-2/5 bg-primary rounded-t-2xl'>
                        <Text className='font-staatliches text-3xl text-white'>ALERT PARENTS</Text>
                    </TouchableOpacity>
                    <View className='flex justify-center'>
                        <TextInput 
                            className='h-12 rounded-b-2xl bg-slate-800 font-staatliches text-xl' 
                            placeholder='MESSAGE...'
                            textAlign='center'
                        />
                        <TouchableOpacity className='absolute right-2'>
                            <Image source={require('@/assets/icons/send.png')} className='h-7 w-7'/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity className='flex justify-center items-center h-1/2 bg-tertiary rounded-2xl mt-4'>
                        <Text className='text-white text-3xl font-staatliches'>CALL 911</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default sos