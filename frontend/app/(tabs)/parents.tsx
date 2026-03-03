import { View, Text, TextInput, TouchableOpacity, Image, FlatList } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { Light } from '@rnmapbox/maps'
import { LinearGradient } from 'expo-linear-gradient'

const parents = () => {
    // Use states
    const [selectedParent, setSelectedParent] = useState("mom");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Temporary parents to render parent dropdown
    const parents = ["mom", "dad"];

    return (
        <SafeAreaView edges={['top']} className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2'>
                <Text className='font-bungee text-3xl color-white pt-3 text-center'>Parents</Text>
                {/* Parent dropdown */}
                <View className='relative'>
                    <TouchableOpacity 
                        className='flex-row justify-between items-center w-1/4 h-9 border-2 rounded-xl border-white px-2'
                        onPress={() => {dropdownOpen ? setDropdownOpen(false) : setDropdownOpen(true)}}
                    >
                        <Text className='text-white font-staatliches'>{selectedParent}</Text>
                        <Image source={require('@/assets/icons/dropdown.png')} className={`h-5 w-5 ${dropdownOpen && 'rotate-180'}`}/>
                    </TouchableOpacity>
                    {dropdownOpen && (
                        <FlatList
                            className='absolute w-1/4 bg-slate-800 top-11 z-10 rounded-lg'
                            data={parents}
                            renderItem={({item}) => (
                                <TouchableOpacity onPress={() => {setSelectedParent(item); setDropdownOpen(false);}}>
                                    {selectedParent === item && (
                                        <View className='absolute top-1 bottom-1 left-1 w-1 bg-white rounded-md'></View>
                                    )}
                                    <Text className='text-center text-white font-staatliches'>{item}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item}
                        />
                    )}
                    
                </View>
                {/* Chat box */}
                <View className='flex flex-1 relative w-full rounded-2xl bg-[#12151D] my-2 p-3'>
                    <View className='w-full flex flex-1'>

                    </View>
                    <View className='flex w-full flex-row items-center mt-3 gap-2'>
                        <TextInput 
                            className='flex flex-1 bg-slate-800 rounded-xl px-3 font-calsans'
                            placeholder='Message'
                        >

                        </TextInput>
                        <TouchableOpacity className='flex justify-center items-center w-12 h-12 overflow-hidden rounded-full'>
                            <LinearGradient
                                className='flex justify-center items-center h-12 w-12'
                                colors={['#10E5B2', '#FF6F52']}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Image source={require('@/assets/icons/send.png')} className='h-6 w-6'/>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default parents