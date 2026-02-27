import { Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'

type radioButtonProps = {
    label: string,
    value: string,
    travelMode: string,
    onValueChange: (value: string) => void
    color: string
};

const RadioButton = ({label, value, travelMode, onValueChange, color} : radioButtonProps) => {
    let isSelected = value === travelMode;

    const radioText = (
        <Text className='text-white font-staatliches'>{label} </Text>
    );

    let iconPath = null;
    if (label === "walking") iconPath = require('@/assets/icons/walking.png');
    else if (label === "cycling") iconPath = require("@/assets/icons/biking.png");
    else iconPath = require("@/assets/icons/car-side.png");
    const radioIcon = (
        <Image source={iconPath} className='h-5 w-5' />
    );

    return (
        <TouchableOpacity className='flex-1' onPress={() => onValueChange(value)}>
            {isSelected ? (
                <View className='flex-row h-10 border-2 rounded-xl justify-center items-center p-2 my-2' style={{backgroundColor: color, borderColor: color}}>
                    {radioText}
                    {radioIcon}
                </View>
            ) : (
                <View className='flex-row h-10 border-2 rounded-xl justify-center items-center p-2 my-2' style={{borderColor: color}}>
                    {radioText}
                    {radioIcon}
                </View>
            )}
            
        </TouchableOpacity>
    )
}

export default RadioButton