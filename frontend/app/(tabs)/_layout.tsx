import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // tabBarShowLabel: false,

            }}
        >
            <Tabs.Screen 
                name='index'
                options={{
                    title: 'Home'
                }}
            />
            <Tabs.Screen 
                name='parents'
                options={{
                    title: 'Parents'
                }}
            />
            <Tabs.Screen 
                name='sos'
                options={{
                    title: 'SOS'
                }}
            />
            <Tabs.Screen 
                name='profile'
                options={{
                    title: 'Profile'
                }}
            />
        </Tabs>
    )
}