import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

type radioButtonProps = {
    label: string,
    value: string,
    travelMode: string,
    onValueChange: (value: string) => void
};

const RadioButton = ({label, value, travelMode, onValueChange} : radioButtonProps) => {
    let isSelected = value === travelMode

    return (
        <TouchableOpacity className='flex-1' onPress={() => onValueChange(value)}>
            {isSelected ? (
                <View className='h-10 border-2 rounded-xl justify-center items-center p-2 m-2 bg-primary' style={{transform: [{scale: 1.1}]}}>
                    <Text className='text-black font-staatliches'>{label}</Text>
                </View>
            ) : (
                <View className='h-10 border-2 rounded-xl border-primary justify-center items-center p-2 m-2'>
                    <Text className='text-white font-staatliches'>{label}</Text>
                </View>
            )}
            
        </TouchableOpacity>
    )
}

export default RadioButton