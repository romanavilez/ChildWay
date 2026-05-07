import { View, Text, TouchableOpacity, Image, FlatList, TextInput, KeyboardAvoidingView, Modal } from 'react-native'
import React, {useState, useCallback} from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ChatBlock from '@/components/ChatBlock';
import { useAuthStore } from '@/store/auth.store';

export default function messages() {
    type conversationProps = {
        conversation_id: number,
        user_id: string
    }

    // Use states
    const [selectedChild, setSelectedChild] = useState("roman");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [messageList, setMessageList] = useState<{
        isSending: boolean,
        recipient: string,
        message: string, 
        time: string
    }[]>([]);
    const [messageText, setMessageText] = useState("");
    const [chatOpen, setChatOpen] = useState(false);
    const [openConversations, setOpenConversations] = useState<conversationProps[] | []>([]);

    // Auth states
    const userId = useAuthStore((state) => state.username);

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

    const getAllConversations = async () => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/get-all-conversations/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        })

        const data = await res.json();

        console.log("conversations:", data.conversations);

        if (res.ok) setOpenConversations(data.conversations);
    }

    useFocusEffect(
        useCallback(() => {
            getAllConversations();
        }, [])
    );

    return (
        <View className='flex-1 bg-secondary'> 
            <View className='relative flex-1 bg-white/20'>
                {openConversations.length > 0 ? (
                    <FlatList
                        data={openConversations}
                        keyExtractor={(item) => item.conversation_id.toString()}
                        renderItem={({item}) => (
                            <View className='w-full h-16 bg-red-300'>
                                <Text>{item.user_id}</Text>
                            </View>
                        )}
                    >
                    </FlatList>
                ) : (
                    <View className='flex-1 justify-center items-center'>
                        <Text className='font-staatliches text-white text-2xl'>No conversations</Text>
                    </View>
                )}
                <TouchableOpacity 
                    className='absolute flex justify-center items-center bg-tertiary w-16 h-16 rounded-2xl right-5 bottom-5'
                >
                    <Image 
                        source={require('@/assets/icons/add-chat.png')} 
                        className='w-10 h-10' 
                        style={{tintColor:'white'}}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>

            {/* Open chat */}
            <Modal
                visible={chatOpen}
                transparent
                animationType='slide'
            >
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
                                <TouchableOpacity 
                                    className='flex justify-center items-center w-12 h-12 overflow-hidden rounded-full' 
                                    onPress={() => handleSendMessage()}
                                >
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
            </Modal>
            
        </View>
    )
}