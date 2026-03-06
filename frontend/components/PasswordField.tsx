import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'

type passwordFieldProps = {
    placeholder: string
    tint?: string
}

const PasswordField = ({placeholder, tint}: passwordFieldProps) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    let passwordPath = null;
    if (passwordVisible) passwordPath = require('@/assets/icons/eye.png');
    else passwordPath = require('@/assets/icons/eye-crossed.png');
    let PasswordIcon = (
        <Image source={passwordPath} className='h-5 w-5' style={tint && {tintColor: tint}}/>
    );

    return (
        <View className='flex-row justify-center items-center w-4/5 h-16 rounded-xl bg-white mt-3 px-2'>
            <TextInput
                className='flex-1 w-full h-full text-secondary font-oswald-light'
                placeholder={placeholder}
                placeholderTextColor={'#999'}
                secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                {PasswordIcon}
            </TouchableOpacity>
        </View>
    )
}

export default PasswordField