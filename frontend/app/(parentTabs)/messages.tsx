import { View, Text, TouchableOpacity, Image, FlatList, TextInput, KeyboardAvoidingView } from 'react-native'
import React, {useState} from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import ChatBlock from '@/components/ChatBlock';

export default function messages() {
    // Use states
    const [selectedChild, setSelectedChild] = useState("roman");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [messageList, setMessageList] = useState([
        {"isSending": false, "recipient": "roman", "message": "Hey mom, can I go to the park with Bob?", "time": "4:30 PM"},
        {"isSending": true, "recipient": "roman", "message": "Have you finished your homework?", "time": "4:31 PM"},
        {"isSending": false, "recipient": "roman", "message": "Almost", "time": "4:32 PM"},
        {"isSending": true, "recipient": "roman", "message": "Well when you finish ask me again", "time": "4:35 PM"},
        {"isSending": false, "recipient": "roman", "message": "I just finished, can I go now?", "time": "5:33 PM"},
        {"isSending": true, "recipient": "roman", "message": "Yes, you can go now", "time": "5:34 PM"}
    ]);
    const [messageText, setMessageText] = useState("");

    // Temporary parents to render parent dropdown
    const children = ["roman", "bobby"];

    // Grab current time in 12 hour format
    const getCurrentTime = () => {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return time;
    }

    // Logic when sending a message
    const handleSendMessage = () => {
        const message = {"isSending": true, "recipient": selectedChild, "message": messageText, "time": getCurrentTime()};
        setMessageList([...messageList, message])
        setMessageText("");
    }

    return (
        <View className='flex-1 bg-secondary'> 
            <View className='flex flex-1 px-2'>
                {/* Parent dropdown */}
                <View className='relative'>
                    <TouchableOpacity 
                        className='flex-row justify-between items-center w-1/4 h-9 border-2 rounded-xl border-tertiary px-2'
                        onPress={() => {dropdownOpen ? setDropdownOpen(false) : setDropdownOpen(true)}}
                    >
                        <Text className='text-white font-staatliches'>{selectedChild}</Text>
                        <Image source={require('@/assets/icons/dropdown.png')} className={`h-5 w-5 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} style={{tintColor: '#FF6F52'}}/>
                    </TouchableOpacity>
                    {dropdownOpen && (
                        <FlatList
                            className='absolute w-1/4 bg-slate-800 top-11 z-10 rounded-lg'
                            data={children}
                            renderItem={({item}) => (
                                <TouchableOpacity onPress={() => {setSelectedChild(item); setDropdownOpen(false);}}>
                                    {selectedChild === item && (
                                        <View className='absolute top-1 bottom-1 left-1 w-1 bg-tertiary rounded-md'></View>
                                    )}
                                    <Text className='text-center text-white font-staatliches'>{item}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item}
                        />
                    )}
                    
                </View>
                {/* Chat container */}
                <KeyboardAvoidingView className='flex-1' behavior='padding' keyboardVerticalOffset={25}>
                    <View className='flex flex-1 relative w-full rounded-2xl bg-[#12151D] my-2 p-3'>
                        {/* Messages */}
                        <View className='w-full flex flex-1'>
                            <FlatList
                                inverted
                                data={[...messageList].reverse()}
                                renderItem={({item}) => {
                                    if (item.recipient !== selectedChild) return null;
                                    return (<ChatBlock isSending={item.isSending} message={item.message} time={item.time}/>)
                                }}
                            >

                            </FlatList>
                        </View>
                        {/* Message box */}
                        <View className='flex w-full flex-row items-center mt-3 gap-2'>
                            <TextInput 
                                className='flex flex-1 bg-slate-800 rounded-3xl px-3 font-oswald-regular text-white'
                                placeholder='Message'
                                value={messageText}
                                onChangeText={setMessageText}
                            />
                            <TouchableOpacity className='flex justify-center items-center w-12 h-12 overflow-hidden rounded-full' onPress={() => handleSendMessage()}>
                                <LinearGradient
                                    className='flex justify-center items-center h-12 w-12'
                                    colors={['#FF6F52', '#FE9A3D']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 0.8, y: 1 }}
                                >
                                    <Image source={require('@/assets/icons/send.png')} className='h-6 w-6'/>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View>
    )
}