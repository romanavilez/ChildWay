import { View, Text, TextInput, TouchableOpacity, Image, FlatList, KeyboardAvoidingView, Modal, Keyboard } from 'react-native'
import { useState, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import ChatBlock from '@/components/ChatBlock'
import { useAuthStore } from '@/store/auth.store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Socket } from 'socket.io-client'
import { getSocket } from '@/services/socket'

const parents = () => {
    const socket = getSocket();
    // types
    type conversationProps = {
        conversation_id: number,
        user_id: string
    }

    type lastMessagesProps = {
        message: string,
        time: string
    }

    // Use states
    const [messageList, setMessageList] = useState<{
        conversation_id: number,
        sender_id: string,
        message_text: string, 
        created_at: string
    }[]>([]);
    const [messageText, setMessageText] = useState("");
    const [chatOpen, setChatOpen] = useState(false);
    const [openConversations, setOpenConversations] = useState<conversationProps[] | []>([]);
    const [conversationPartner, setConversationPartner] = useState<string | null>(null);
    const [currentConversation, setCurrentConversation] = useState<number | null>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [lastMessages, setLastMessages] = useState<Map<number, lastMessagesProps>>(new Map());
    

    // Auth states
    const userId = useAuthStore((state) => state.username);

    // Grab current time in 12 hour format
    const getCurrentTime = (timestamp: string) => {
        const time = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return time;
    }

    // Logic when sending a message
    const handleSendMessage = async (conversationId: number, sender: string, text: string) => {
        let createdAt: string = "";
        // store message in database
        try {
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/messages/create-message`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({conversationId, sender, text})
            });

            const data = await res.json();

            if (res.ok) {
                createdAt = data.time;
            } else {
                console.log("Error:", data.error);
            }

        } catch (error) {
            console.log("Message creation failed:", error);
        }
        // Display messsage
        if (!createdAt) createdAt = new Date().toISOString();
        const message = {"conversation_id": conversationId, "sender_id": sender, "message_text": text, "created_at": createdAt};
        setMessageList((prev) => [...prev, message]);
        setMessageText("");
        // Send message through socket
        if (socket) {
            socket.emit("send_message", {conversationId, sender, text, createdAt});
        }
    }

    // Get all messages for a specific convervsation
    const getAllMessages = async (conversation_id: number) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/messages/get-all-messages/${conversation_id}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        })

        const data = await res.json();

        if (res.ok) {
            setMessageList(data.messages);
        }
    }

    // Get last message for all conversations
    const getLastMessage = async (conversationId: number) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/messages/get-last-message/${conversationId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        });

        const data = await res.json();

        if (res.ok && data.message) {
            const lastMessage = {message: data.message, time: data.timestamp }
            setLastMessages((prev) => {
                const newMap = new Map(prev);
                newMap.set(conversationId, lastMessage);
                return newMap;
            });
        }
    }

    // Get all conversations for this specific user
    const getAllConversations = async () => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/get-all-conversations/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        })

        const data = await res.json();

        console.log("conversations:", data.conversations);

        if (res.ok) setOpenConversations(data.conversations);
    }

    // Handle opening conversation
    useEffect(() => {
        if (!currentConversation) return;
        if (!socket) return;
        // Join room with message:currentConversation as the room
        socket.emit("open_message", currentConversation);
        // Update message list on receive_message
        const messageHandler = (data: {conversationId: number, sender: string, text: string, createdAt: string}) => {
            const message = {"conversation_id": data.conversationId, "sender_id": data.sender, "message_text": data.text, "created_at": data.createdAt};
            setMessageList((prev) => [...prev, message]);
        }

        socket.on("receive_message", messageHandler);

        return () => {socket.off("receive_message", messageHandler)};

    }, [currentConversation]) 

    // On page render
    useFocusEffect(
        useCallback(() => {
            getAllConversations();
        }, [])
    );

    useEffect(() => {
        if (openConversations.length > 0) {
            openConversations.forEach((conversation) => {
                getLastMessage(conversation.conversation_id);
            });
        }
    }, [openConversations, messageList]);

    useEffect(() => {
        const onShow = Keyboard.addListener('keyboardDidShow', () => {setKeyboardVisible(true)});
        const onHide = Keyboard.addListener('keyboardDidHide', () => {setKeyboardVisible(false)});

        return () => {onShow.remove(); onHide.remove()}
    }, [])

    return (
        <View className='flex-1 bg-secondary'> 
            <View className='relative flex-1'>
                {/* Conversation list */}
                {openConversations.length > 0 ? (
                    <FlatList
                        data={openConversations}
                        keyExtractor={(item) => item.conversation_id.toString()}
                        renderItem={({item}) => {
                            let time = lastMessages.get(item.conversation_id)?.time;
                            let message = lastMessages.get(item.conversation_id)?.message;
                            return (
                                <TouchableOpacity 
                                    className='flex-row items-center w-full h-20 px-4'
                                    onPress={() => {setCurrentConversation(item.conversation_id); setConversationPartner(item.user_id); getAllMessages(item.conversation_id); setChatOpen(true)}}
                                >
                                    <View className='flex justify-center items-center h-14 w-14 rounded-[100%] bg-secondary-two'>
                                        <Image source={require('@/assets/icons/user.png')} resizeMode='contain' className='h-8 w-8' style={{tintColor:"#64748b"}}/>
                                    </View>
                                    <View className='flex justify-center h-14 ml-4 flex-1'>
                                        <View className='flex-row justify-between'>
                                            <Text className='font-staatliches text-white text-lg'>{item.user_id}</Text>
                                            <Text className='font-oswald-extralight text-slate-500'>{time ? getCurrentTime(time) : ""}</Text>
                                        </View>
                                        <Text className='font-oswald-extralight text-slate-500'>{message ? message : ""}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    >
                    </FlatList>
                ) : (
                    <View className='flex-1 justify-center items-center'>
                        <Text className='font-staatliches text-white text-2xl'>No conversations</Text>
                    </View>
                )}
                <TouchableOpacity 
                    className='absolute flex justify-center items-center bg-primary w-16 h-16 rounded-2xl right-5 bottom-5'
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
                <SafeAreaView className='flex flex-1'>
                    <View className='w-full h-full'>
                        {/* Chat header */}
                        <View className='flex-row items-center h-16 px-4 bg-secondary'>
                            <TouchableOpacity 
                                className='h-8 w-8 mr-4'
                                onPress={() => {
                                    socket?.emit("close_message", currentConversation);
                                    setConversationPartner(null); 
                                    setCurrentConversation(null); 
                                    setMessageList([]); 
                                    setChatOpen(false)
                                }}
                            >
                                <Image source={require("@/assets/icons/arrow-left.png")} resizeMode='contain' style={{tintColor:'white'}} className='h-8 w-8'/>
                            </TouchableOpacity>
                            <View className='flex justify-center items-center h-12 w-12 rounded-[100%] bg-secondary-two'>
                                <Image source={require('@/assets/icons/user.png')} resizeMode='contain' className='h-7 w-7' style={{tintColor:"#64748b"}}/>
                            </View>
                            <Text className='font-staatliches text-white text-xl ml-4'>{conversationPartner}</Text>
                        </View>
                        <View className='w-[95%] h-[2px] self-center rounded-2xl bg-white'/>
                        {/* Chat container */}
                        <KeyboardAvoidingView className='flex-1' behavior={keyboardVisible ? 'padding' : undefined} keyboardVerticalOffset={30}>
                            <View className='flex flex-1 relative w-full bg-secondary p-3'>
                                {/* Messages */}
                                <View className='w-full flex flex-1'>
                                    <FlatList
                                        inverted
                                        data={[...messageList].reverse()}
                                        renderItem={({item}) => {
                                            // if (currentConversation !== item.conversation_id) return null;
                                            return (
                                                <ChatBlock 
                                                    isSending={item.sender_id === userId} 
                                                    message={item.message_text} 
                                                    time={getCurrentTime(item.created_at)}
                                                    blockColor='#10E5B2'
                                                />
                                            )
                                        }}
                                    />
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
                                        onPress={() => handleSendMessage(currentConversation!, userId!, messageText)}
                                    >
                                        <LinearGradient
                                            className='flex justify-center items-center h-12 w-12'
                                            colors={['#10E5B2', '#72f38e']}
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
                </SafeAreaView>
            </Modal>
        </View>
    )
}

export default parents