import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import activeMapIcon from '@/assets/tabIcons/active-map.png'
import activeChatIcon from '@/assets/tabIcons/active-chat.png'
import activeSosIcon from '@/assets/tabIcons/active-sos.png'
import activeProfileIcon from '@/assets/tabIcons/active-user.png'
import mapIcon from '@/assets/tabIcons/map.png'
import chatIcon from '@/assets/tabIcons/chat.png'
import sosIcon from '@/assets/tabIcons/sos.png'
import profileIcon from '@/assets/tabIcons/user.png'

import '../global.css'

import {styles} from '@/assets/styles/index.style'

type tabBarIconProps = {
    focused: boolean,
    icon: ImageSourcePropType,
    activeIcon: ImageSourcePropType
}

export default function TabLayout() {

    const TabBarIcon = ({focused, icon, activeIcon}: tabBarIconProps) => (
        <View className='flex justify-center items-center mt-8 h-10'>
            {focused ? (
                <Image source={activeIcon} resizeMode='contain' style={{height: 50, width: 50}}/>
            ) : (
                <Image source={icon} resizeMode='contain' style={{height: 50, width: 50}} />
            )}
        </View>
    )

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 100,
                    
                }
            }}
        >
            <Tabs.Screen 
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={mapIcon} activeIcon={activeMapIcon}/>)
                }}
            />
            <Tabs.Screen 
                name='parents'
                options={{
                    title: 'Parents',
                    tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={chatIcon} activeIcon={activeChatIcon}/>)
                }}
            />
            <Tabs.Screen 
                name='sos'
                options={{
                    title: 'SOS',
                    tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={sosIcon} activeIcon={activeSosIcon}/>)
                }}
            />
            <Tabs.Screen 
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (<TabBarIcon focused={focused} icon={profileIcon} activeIcon={activeProfileIcon}/>)
                }}
            />
        </Tabs>
    )
}