import { Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'

// Prop types
type radioButtonProps = {
    label: string,
    value: string,
    travelMode: string,
    onValueChange: (value: string) => void
    color: string
};

const RadioButton = ({label, value, travelMode, onValueChange, color} : radioButtonProps) => {
    // Used to check if this radio button is already selected
    let isSelected = value === travelMode;

    // Component that stores the radio button text
    const RadioText = (
        <Text className='text-white font-staatliches'>{label} </Text>
    );

    // Set image of radio icon component based on radio button label
    let iconPath = null;
    if (label === "walking") iconPath = require('@/assets/icons/walking.png');
    else if (label === "cycling") iconPath = require("@/assets/icons/biking.png");
    else iconPath = require("@/assets/icons/car-side.png");
    const RadioIcon = (
        <Image source={iconPath} className='h-5 w-5' />
    );

    return (
        <TouchableOpacity className='flex-1' onPress={() => onValueChange(value)}>
            {isSelected ? (
                <View className='flex-row h-10 border-2 rounded-xl justify-center items-center p-2 my-2' style={{backgroundColor: color, borderColor: color}}>
                    {RadioText}
                    {RadioIcon}
                </View>
            ) : (
                <View className='flex-row h-10 border-2 rounded-xl justify-center items-center p-2 my-2' style={{borderColor: color}}>
                    {RadioText}
                    {RadioIcon}
                </View>
            )}
            
        </TouchableOpacity>
    )
}

export default RadioButton