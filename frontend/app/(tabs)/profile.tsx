import { View, Text, TouchableOpacity, Modal, TextInput, Image, Touchable } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Models } from '@rnmapbox/maps';
import { LinearGradient } from 'expo-linear-gradient';

const profile = () => {
    const [loginVisible, setLoginVisible] = useState(false);
    const [signupVisible, setSignupVisible] = useState(true);
    const [passwordVisible, setPasswordVisible] = useState(false);

    let passwordPath = null;
    if (passwordVisible) passwordPath = require('@/assets/icons/eye.png');
    else passwordPath = require('@/assets/icons/eye-crossed.png');
    let PasswordIcon = (
        <Image source={passwordPath} className='h-5 w-5'/>
    );

    return (


        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2 items-center'>
                <Text className='font-bungee text-3xl color-white'>Profile</Text>
                <View className='w-full flex-1 rounded-2xl bg-gray-200 mb-2'> 
                    <TouchableOpacity 
                        className='flex justify-center w-full h-20 bg-primary rounded-xl'
                        onPress={() => setLoginVisible(true)}
                    >
                        <Text className='text-center font-staatliches text-white text-xl'>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Login page */}
            <Modal
                visible={loginVisible}
                transparent
                animationType='fade'
            >
                <SafeAreaView className='flex-1 bg-secondary items-center'>
                    <View className='flex-1 justify-center items-center w-4/5'>
                        <Text className='text-white text-5xl font-staatliches mt-10'>Welcome Back!</Text>
                        <Text className='text-slate-500 font-staatliches text-xl'>Enter Your Username & Password</Text>
                        {/* Username field */}
                        <View className='flex-row justify-between items-center w-full h-16 rounded-xl bg-white mt-10 px-2'>
                            <TextInput
                                className='flex-1 w-full h-full text-secondary font-oswald-light'
                                placeholder='Username'
                                placeholderTextColor={'#999'}
                            />
                            <Image source={require('@/assets/icons/envelope.png')} className='w-5 h-5'/>
                        </View>
                        {/* Password field */}
                        <View className='flex-row justify-center items-center w-full h-16 rounded-xl bg-white mt-3 px-2'>
                            <TextInput
                                className='flex-1 w-full h-full text-secondary font-oswald-light'
                                placeholder='Password'
                                placeholderTextColor={'#999'}
                                secureTextEntry={!passwordVisible}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                                {PasswordIcon}
                            </TouchableOpacity>
                        </View>
                        {/* Login button */}
                        <TouchableOpacity className='w-full h-16 rounded-full overflow-hidden mt-3'>
                            <LinearGradient
                                className='flex justify-center w-full h-full'
                                colors={["#10E5B2", "#72f38e"]}
                                start={{x: 0, y:1}}
                                end={{x:1, y:0}}
                            >
                                <Text className='text-center text-3xl text-white font-staatliches'>Login</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity className='mt-3'>
                            <Text className='text-slate-500 font-staatliches'>Forgot password?</Text>
                        </TouchableOpacity>
                        {/* login/sign up separation */}
                        <View className='flex-row items-center justify-between w-full  h-10 my-5'>
                            <View className='w-5/12 h-0.5 bg-white'></View>
                            <Text className='font-staatliches text-white'>or</Text>
                            <View className='w-5/12 h-0.5 bg-white'></View>
                        </View>
                        {/* Sign up button */}
                        <TouchableOpacity className='w-full h-16 rounded-full overflow-hidden'>
                            <LinearGradient
                                className='flex justify-center w-full h-full'
                                colors={["#FF6F52", '#F78361']}
                                start={{x:0, y:1}}
                                end={{x:1, y:0}}
                            >
                                <Text className='font-staatliches text-white text-center text-3xl'>Sign up</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
            {/* Sign up page */}
            
        </View>
    )
}

export default profile