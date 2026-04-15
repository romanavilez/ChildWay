import { useState } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {router} from 'expo-router'
import PasswordField from '@/components/PasswordField';
import InputField from '@/components/InputField';
import FormButton from '@/components/FormButton';

const SignUp = () => {
    // Use states
    const [user, setUser] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    // Load icons
    const emailIcon = require('@/assets/icons/envelope.png');
    const nameIcon = require('@/assets/icons/last-name.png');

    const userTypes = ['parent', 'child'];

    const handleSignUp = () => {
        router.replace('./login')
    }

    return (
        <SafeAreaView className='flex-1 bg-secondary items-center justify-center'>
            <LinearGradient 
                className='absolute top-0 w-full h-4/5'
                colors={["#FF6F52", "#FE9A3D"]}
                start={{x:0, y:1}}
                end={{x:1, y:1}}
            />
            <View className='flex h-auto w-full items-center z-10 bg-secondary rounded-tl-full'>
                <Text className='font-staatliches text-white text-5xl'>Create account</Text>
                {/* User selection */}
                <View className='flex-row justify-between items-center w-4/5 mt-10 mb-10'>
                    <Text className='font-staatliches text-white text-xl'>Are you a parent or a child?</Text>
                    <View className='relative z-10'>
                        <TouchableOpacity 
                            className='flex-row items-center space-between rounded-lg p-1 border border-tertiary-two' 
                            onPress={() => {dropdownOpen ? setDropdownOpen(false) : setDropdownOpen(true)}}
                            >
                            <Text className='w-20 font-staatliches text-white'>{user}</Text>
                            <Image 
                                source={require('@/assets/icons/dropdown.png')} 
                                className={`w-5 h-5 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                                style={{tintColor: '#FE9A3D'}}
                                />
                        </TouchableOpacity>
                        {dropdownOpen && (
                            <FlatList
                                className='absolute left-0 top-8 w-full rounded-lg mt-1'
                                data={userTypes}
                                renderItem={({item}) => (
                                    <TouchableOpacity className='bg-tertiary-two p-1' onPress={() => {setUser(item); setDropdownOpen(false);}}>
                                        <Text className='font-staatliches text-white text-center'>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}                    
                    </View>
                </View>
                {/* Sign up fields */}
                <InputField placeholder='Full Name' icon={nameIcon} value={fullName} onChangeText={setFullName} marginTop='mt-10' tint='#FF6F52'/>
                <InputField placeholder='Email' icon={emailIcon} value={email} onChangeText={setEmail} tint='#FF6F52'/>
                <PasswordField placeholder='Password' tint='#FF6F52'/>
                <PasswordField placeholder='Confirm Password' tint='#FF6F52'/>
                {/* Sign up button */}
                <FormButton text='Sign Up' gradientLeft='#FF6F52' gradientRight='#FE9A3D' onPress={handleSignUp}/>
                {/* Login button */}
                <View className='flex-row mt-10'>
                    <Text className='font-staatliches text-slate-500'>Already have an account? </Text>
                    <TouchableOpacity onPress={() => {router.replace('./login')}}>
                        <Text className='font-staatliches underline text-primary'>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SignUp