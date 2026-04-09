import { View, Text, ImageSourcePropType, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

// Images
import mapIcon from '@/assets/parentTabIcons/map.png'
import childrenIcon from '@/assets/parentTabIcons/family.png'
import messagesIcon from '@/assets/parentTabIcons/messages.png'
import profileIcon from '@/assets/parentTabIcons/profile.png'

// Prop types
type tabBarIconProps = {
    focused: boolean,
    icon: ImageSourcePropType,
    tabName: string
}

export default function TabLayout() {
    const TabBarIcon = ({focused, icon, tabName} : tabBarIconProps) => (
        <View className='flex justify-center items-center mt-10 h-12' style={{width: 60}}>
            {focused ? (
                <Image source={icon} resizeMode='contain' style={{width: 25, height: 25, tintColor:'white'}}/>
            ) : (
                <Image source={icon} resizeMode='contain' style={{width: 25, height: 25, tintColor:'#64748b'}}/>
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
                    tabBarItemStyle: {
                        flex: 1
                    }
                }}
            >
                <Tabs.Screen 
                    name='index'
                    options={{
                        title: 'Home',
                        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} icon={mapIcon} tabName='Location'></TabBarIcon>)
                    }}
                />
                <Tabs.Screen 
                    name='children'
                    options={{
                        title: 'Children',
                        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} icon={childrenIcon} tabName='Children'></TabBarIcon>)
                    }}
                />
                <Tabs.Screen 
                    name='messages'
                    options={{
                        title: 'Messages',
                        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} icon={messagesIcon} tabName='Messages'></TabBarIcon>)
                    }}
                />
                <Tabs.Screen 
                    name='profile'
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({focused}) => (<TabBarIcon focused={focused} icon={profileIcon} tabName='Profile'></TabBarIcon>)
                    }}
                />
            </Tabs>
        </SafeAreaView>
    )
}