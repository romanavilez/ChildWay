import { View, Text, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'

type formButtonProps = {
    text: string
    gradientLeft: string
    gradientRight: string
    onPress: VoidFunction
}

const FormButton = ({text, gradientLeft, gradientRight, onPress} : formButtonProps) => {
    return (
        <TouchableOpacity className='w-4/5 h-16 rounded-full overflow-hidden mt-3' onPress={onPress}>
            <LinearGradient
                className='flex justify-center w-full h-full'
                colors={[gradientLeft, gradientRight]}
                start={{x: 0, y:1}}
                end={{x:1, y:0}}
            >
                <Text className='text-center text-3xl text-white font-staatliches'>{text}</Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}

export default FormButton