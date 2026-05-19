import { View, Text, Image } from 'react-native'
import React from 'react'

type profileFieldProps = {
    type: string,
    value: string,
    color: string
}

const ProfileField = ({type, value, color} : profileFieldProps) => {
    const getIcon = () => {
        if (type === 'email') return (
            <Image source={require('@/assets/icons/envelope.png')} className='h-5 w-5' style={{tintColor: color}} resizeMode='contain'/>
        )
        else if (type === 'username') return (
            <Image source={require('@/assets/icons/username.png')} className='h-5 w-5' style={{tintColor: color}} resizeMode='contain'/>
        )
        else if (type === 'name') return (
            <Image source={require('@/assets/icons/user.png')} className='h-5 w-5' style={{tintColor: color}} resizeMode='contain'/>
        )
        else if (type === 'role') return (
            <Image source={require('@/assets/icons/role.png')} className='h-5 w-5' style={{tintColor: color}} resizeMode='contain'/>
        )
    };

    return (
        <View className='flex w-[90%] mb-2'>
            <Text className='font-staatliches text-white'>{type}</Text>
            <View className='flex-row items-center gap-2 h-14 bg-white rounded-md pl-2'>
                {getIcon()}
                <Text className='font-oswald-extralight text-secondary text-lg'>{value}</Text>
            </View>
        </View>
    )
}

export default ProfileField