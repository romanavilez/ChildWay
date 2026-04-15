import { View, Text, TextInput, Image, ImageSourcePropType } from 'react-native'
import React from 'react'

type inputFieldProps = {
    placeholder: string
    icon: ImageSourcePropType
    value: string
    onChangeText: (value:string) => void
    marginTop?: string
    tint?: string
}

const InputField = ({placeholder, icon, value, onChangeText, marginTop, tint}: inputFieldProps) => {


    return (
        <View className={`flex-row justify-between items-center w-4/5 h-16 rounded-xl bg-white px-2 ${marginTop ? marginTop : 'mt-3'}`}>
            <TextInput
                className='flex-1 w-full h-full text-secondary font-oswald-light'
                placeholder={placeholder}
                placeholderTextColor={'#999'}
                value={value}
                onChangeText={onChangeText}
            />
            <Image source={icon} className='w-5 h-5' style={tint && {tintColor: tint}}/>
        </View>
    )
}

export default InputField