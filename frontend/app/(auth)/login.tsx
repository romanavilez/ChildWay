import {View, Text, TouchableOpacity} from 'react-native'
import { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import PasswordField from '@/components/PasswordField';
import InputField from '@/components/InputField';
import FormButton from '@/components/FormButton';

import { useAuthStore } from '@/store/auth.store';


const Login = () => {
    // Use states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Load icons
    const usernameIcon = require('@/assets/icons/user.png');

    // state functions
    const login = useAuthStore((state) => state.login);
    const setType = useAuthStore((state) => state.setType); 
    
    // Verify user exists in database and log them in
    const handleLogin = async () => {
        try {
            // POST login
            const res = await fetch("http://10.0.0.99:5001/api/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username})
            });
            // Store data returned
            const data = await res.json();

            if (res.ok) {
                // Update auth store and route user to role-based interface
                login(username, "");
                if (data.user.role === "parent") router.replace('../(parentTabs)');
                else if (data.user.role === "child") router.replace('../(childTabs)');
            } else {
                console.log("login failed");
            }
        } catch (error) {
            console.log("Error logging in:", error);
        }

    }

    return (
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
                <InputField placeholder='Username' icon={usernameIcon} value={username} onChangeText={setUsername} marginTop='mt-10'/>
                {/* Password field */}
                <PasswordField placeholder="Password"/>
                {/* Login button */}
                <FormButton text='Login' gradientLeft='#10E5B2' gradientRight='#72f38e' onPress={handleLogin}/>
                <TouchableOpacity className='mt-3'>
                    <Text className='text-slate-500 font-staatliches'>Forgot password?</Text>
                </TouchableOpacity>
                {/* Sign up button */}
                <View className='flex-row mt-10'>
                    <Text className='font-staatliches text-slate-500'>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => {router.replace('./sign-up')}}>
                        <Text className='font-staatliches underline text-tertiary'>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Login;

