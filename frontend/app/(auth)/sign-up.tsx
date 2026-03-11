import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import PasswordField from '@/components/PasswordField';
import InputField from '@/components/InputField';
import FormButton from '@/components/FormButton';

const SignUp = () => {
    const emailIcon = require('@/assets/icons/envelope.png');
    const firstNameIcon = require('@/assets/icons/first-name.png');
    const lastNameIcon = require('@/assets/icons/last-name.png');

    const handleSignUp = () => {
        
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
                {/* Sign up fields */}
                <Text className='font-staatliches text-white text-5xl'>Create account</Text>
                <InputField placeholder='First Name' icon={firstNameIcon} marginTop='mt-10' tint='#FF6F52'/>
                <InputField placeholder='Last Name' icon={lastNameIcon} tint='#FF6F52'/>
                <InputField placeholder='Email' icon={emailIcon} tint='#FF6F52'/>
                <PasswordField placeholder='Password' tint='#FF6F52'/>
                <PasswordField placeholder='Confirm Password' tint='#FF6F52'/>
                {/* Sign up button */}
                <FormButton text='Sign Up' gradientLeft='#FF6F52' gradientRight='#FE9A3D' onPress={handleSignUp}/>
                {/* Login button */}
                <View className='flex-row mt-10'>
                    <Text className='font-staatliches text-slate-500'>Already have an account? </Text>
                    <TouchableOpacity>
                        <Text className='font-staatliches underline text-primary'>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SignUp