import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import mapIcon from '@/assets/tabIcons/map.png'
import messagesIcon from '@/assets/tabIcons/messages.png'
import sosIcon from '@/assets/tabIcons/sos.png'
import profileIcon from '@/assets/tabIcons/profile.png'

import '../global.css'

import {styles} from '@/assets/styles/index.style'
import { SafeAreaView } from 'react-native-safe-area-context'

// Prop types
type tabBarIconProps = {
    focused: boolean,
    icon: ImageSourcePropType
    tabName: string
}

export default function TabLayout() {
    // Handles appearance of tab bar icon when focused or not
    const TabBarIcon = ({focused, icon, tabName}: tabBarIconProps) => (
        <View className='flex justify-center items-center mt-10 h-12' style={{width:60}}>
            {focused ? (
                <Image source={icon} resizeMode='contain' style={{height: 25, width: 25, tintColor: 'white'}} />
            ) : (
                <Image source={icon} resizeMode='contain' style={{height: 25, width: 25, tintColor: "#64748B"}} />
            )}
            <Text className={`font-staatliches text-sm ${focused ? 'text-white' : 'text-[#64748b]'}`}>{tabName}</Text>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-secondary'>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        height:70,
                        borderTopWidth: 0,
                        marginBottom: 0,
                        backgroundColor: '#12151D'
                    },
                }}
            >
                <Tabs.Screen 
                    name='index'
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={mapIcon} tabName='Map'/>)
                    }}
                />
                <Tabs.Screen 
                    name='parents'
                    options={{
                        title: 'Parents',
                        tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={messagesIcon} tabName='Messages'/>)
                    }}
                />
                <Tabs.Screen 
                    name='sos'
                    options={{
                        title: 'SOS',
                        tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={sosIcon} tabName='SOS'/>)
                    }}
                />
                <Tabs.Screen 
                    name='profile'
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={profileIcon} tabName='Profile'/>)
                    }}
                />
            </Tabs>
        </SafeAreaView>
    )
}