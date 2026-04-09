import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

const sos = () => {
    return (
        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl color-white'>SOS</Text>
                <View className='w-full flex-1 rounded-2xl bg-[#12151D] mb-2 p-3'>
                    {/* Alert parents button */}
                    <TouchableOpacity className='flex justify-center items-center h-2/5 rounded-t-2xl overflow-hidden'>
                        <LinearGradient 
                            className={`absolute w-full h-full`}
                            colors={['#10E5B2', '#72f38e']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                        />
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
                    {/* Call 911 button */}
                    <TouchableOpacity className='flex justify-center items-center h-1/2 rounded-2xl mt-4 overflow-hidden'>
                        <LinearGradient 
                            className='absolute w-full h-full'
                            colors={['#F54B64', '#FE9A3D']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text className='text-white text-3xl font-staatliches'>CALL 911</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default sos