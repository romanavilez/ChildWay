import { View, Text, TouchableOpacity, Modal, TextInput, Image, Touchable } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Models } from '@rnmapbox/maps';
import { LinearGradient } from 'expo-linear-gradient';
import PasswordField from '@/components/PasswordField';
import InputField from '@/components/InputField';
import FormButton from '@/components/FormButton';

const profile = () => {
    const [loginVisible, setLoginVisible] = useState(false);
    const [signupVisible, setSignupVisible] = useState(false);

    // Load icons
    const usernameIcon = require('@/assets/icons/user.png');
    const emailIcon = require('@/assets/icons/envelope.png');
    const firstNameIcon = require('@/assets/icons/first-name.png');
    const lastNameIcon = require('@/assets/icons/last-name.png');

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
                <SafeAreaView className='flex-1 bg-secondary items-center justify-center'>
                    <LinearGradient
                        className='absolute top-0 w-full h-4/5'
                        colors={["#10E5B2", "#72f38e"]}
                        start={{x:0, y:1}}
                        end={{x:1, y:0}}
                    />
                    <View className='h-auto justify-center items-center w-full bg-secondary rounded-tl-full'>
                        <Text className='text-white text-5xl font-staatliches mt-10'>Welcome Back!</Text>
                        <Text className='text-slate-500 font-staatliches text-xl'>Enter Your Username & Password</Text>
                        {/* Username field */}
                        <InputField placeholder='Username' icon={usernameIcon} marginTop='mt-10'/>
                        {/* Password field */}
                        <PasswordField placeholder="Password"/>
                        {/* Login button */}
                        <FormButton text='Login' gradientLeft='#10E5B2' gradientRight='#72f38e'/>
                        <TouchableOpacity className='mt-3'>
                            <Text className='text-slate-500 font-staatliches'>Forgot password?</Text>
                        </TouchableOpacity>
                        {/* Sign up button */}
                        <View className='flex-row mt-10'>
                            <Text className='font-staatliches text-slate-500'>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => {setLoginVisible(false); setSignupVisible(true);}}>
                                <Text className='font-staatliches underline text-tertiary'>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
            {/* Sign up page */}
            <Modal
                visible={signupVisible}
                transparent
                animationType='fade'
            >
                <SafeAreaView className='flex-1 bg-secondary items-center justify-center'>
                    <LinearGradient 
                        className='absolute top-0 w-full h-4/5'
                        colors={["#FF6F52", "#FE9A3D"]}
                        start={{x:0, y:1}}
                        end={{x:1, y:1}}
                    />
                    <View className='flex h-auto w-full items-center z-10 bg-secondary rounded-tl-full'>
                        {/* Sign up fields */}
                        <Text className='font-staatliches text-white text-5xl'>Create account</Text>
                        <InputField placeholder='First Name' icon={firstNameIcon} marginTop='mt-10' tint='#FF6F52'/>
                        <InputField placeholder='Last Name' icon={lastNameIcon} tint='#FF6F52'/>
                        <InputField placeholder='Email' icon={emailIcon} tint='#FF6F52'/>
                        <PasswordField placeholder='Password' tint='#FF6F52'/>
                        <PasswordField placeholder='Confirm Password' tint='#FF6F52'/>
                        {/* Sign up button */}
                        <FormButton text='Sign Up' gradientLeft='#FF6F52' gradientRight='#FE9A3D'/>
                        {/* Login button */}
                        <View className='flex-row mt-10'>
                            <Text className='font-staatliches text-slate-500'>Already have an account? </Text>
                            <TouchableOpacity onPress={() => {setSignupVisible(false); setLoginVisible(true)}}>
                                <Text className='font-staatliches underline text-primary'>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

export default profile