import { useState } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList, Pressable, KeyboardAvoidingView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {router} from 'expo-router'
import PasswordField from '@/components/PasswordField';
import InputField from '@/components/InputField';
import FormButton from '@/components/FormButton';

const SignUp = () => {
    // Use states
    const [role, setRole] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    // Load icons
    const emailIcon = require('@/assets/icons/envelope.png');
    const nameIcon = require('@/assets/icons/last-name.png');

    const userTypes = ['parent', 'child'];

    const handleSignUp = async () => {
        // Missing fields
        if (!username || !email || !password || !role) {
            Alert.alert("Missing required fields", "Make sure to fill in all fields.");
            return;
        }

        // Passwords don't match
        if (password !== confirmPass) {
            Alert.alert("Passwords don't match", "Please try again.");
            return;
        }

        // Invalid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        try {
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/users/signup`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({username, email, password, role})
            })

            const data = await res.json();

            if (res.ok) {
                router.replace('./login')
            } else {
                Alert.alert("Sign Up Failed", data.error);
            }
        } catch (error) {
            console.log("Error signing up:", error);
        }

    }

    return (
        <SafeAreaView className='relative flex-1 bg-secondary items-center justify-center'>
            {/* hide dropdown */}
            {dropdownOpen && (
                <Pressable 
                    className='absolute inset-0 z-10' 
                    onPress={() => setDropdownOpen(false)}
                />
            )}
            <LinearGradient 
                className='absolute top-0 w-full h-4/5'
                colors={["#FF6F52", "#FE9A3D"]}
                start={{x:0, y:1}}
                end={{x:1, y:1}}
            />
            <KeyboardAvoidingView className='w-full' behavior='padding' keyboardVerticalOffset={-50}>
                <View className='flex h-auto w-full items-center bg-secondary rounded-tl-full'>
                    <Text className='font-staatliches text-white text-5xl'>Create an account</Text>
                    <Text className='font-staatliches text-xl text-slate-500'>Just a few details before we get started</Text>
                    {/* User selection */}
                    <View className='flex-row justify-between items-center w-4/5 mt-10'>
                        <Text className='font-staatliches text-white text-xl'>parent or child?</Text>
                        <View className='relative z-10'>
                            {/* selection */}
                            <TouchableOpacity 
                                className='flex-row items-center space-between rounded-lg p-1 border border-tertiary-two' 
                                onPress={() => {dropdownOpen ? setDropdownOpen(false) : setDropdownOpen(true)}}
                                >
                                <Text className='w-20 font-staatliches text-white'>{role}</Text>
                                <Image 
                                    source={require('@/assets/icons/dropdown.png')} 
                                    className={`w-5 h-5 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                                    style={{tintColor: '#FE9A3D'}}
                                    />
                            </TouchableOpacity>
                            {/* dropdown options */}
                            {dropdownOpen && (
                                <FlatList
                                    className='absolute left-0 top-8 w-full rounded-lg mt-1'
                                    data={userTypes}
                                    renderItem={({item}) => (
                                        <TouchableOpacity className='bg-tertiary-two p-1' onPress={() => {setRole(item); setDropdownOpen(false)}}>
                                            <Text className='font-staatliches text-white text-center'>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            )}                    
                        </View>
                    </View>
                    {/* Sign up fields */}
                    <InputField placeholder='Username' icon={nameIcon} value={username} onChangeText={setUsername} tint='#FF6F52'/>
                    <InputField placeholder='Email' icon={emailIcon} value={email} onChangeText={setEmail} tint='#FF6F52'/>
                    <PasswordField placeholder='Password' value={password} onChangeText={setPassword} tint='#FF6F52'/>
                    <PasswordField placeholder='Confirm Password' value={confirmPass} onChangeText={setConfirmPass} tint='#FF6F52'/>
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignUp