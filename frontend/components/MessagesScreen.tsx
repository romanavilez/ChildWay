import { View, FlatList, TouchableOpacity, Text, TextInput, Image, Modal, KeyboardAvoidingView } from "react-native";
import { use, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import ChatBlock from "./ChatBlock";
import { SafeAreaView } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

// types
type conversationProps = {
    last_message: string,
    message_time: string,
    unread_messages: number,
    user_id: string
};

type messageProps = {
    conversation_id: number,
    sender_id: string,
    message_text: string, 
    created_at: string
};

type contactProps = {
    contactId: string
}

type MessageScreenProps = {
    socket: Socket | null,
    openConversations: Map<number, conversationProps>,
    currentConversation: number | null,
    keyboardVisible: boolean,
    messageList: messageProps[] | [],
    messageText: string,
    contacts: contactProps[] | [],
    chatOpen: boolean,
    conversationPartner: string | null,
    newChatOpen: boolean,
    userId: string | null,
    color: string,
    setMessageText: React.Dispatch<React.SetStateAction<string>>,
    setCurrentConversation: React.Dispatch<React.SetStateAction<number | null>>,
    setMessageList: React.Dispatch<React.SetStateAction<messageProps[] | []>>,
    setContacts: React.Dispatch<React.SetStateAction<contactProps[] | []>>,
    setChatOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setConversationPartner: React.Dispatch<React.SetStateAction<string | null>>,
    setNewChatOpen: React.Dispatch<React.SetStateAction<boolean>>,
    zeroUnreadMessages: (conversationId: number, userId: string) => void,
    handleSendMessage: (conversationId: number, sender: string, conversationPartner: string, text: string) => void
    handleNewChat: (conversationPartner: string) => void
    getAllContacts: () => void,
    getAllMessages: (conversation_id: number) => void,
    getCurrentTime: (timestamp: string) => string,
};

const MessagesScreen = ({
    socket,
    openConversations, 
    currentConversation,
    keyboardVisible,
    messageList,
    messageText,
    contacts,
    chatOpen,
    conversationPartner,
    newChatOpen,
    userId,
    color,
    setMessageText,
    setCurrentConversation, 
    setMessageList,
    setContacts,
    setChatOpen,
    setConversationPartner,
    setNewChatOpen,
    zeroUnreadMessages,
    handleSendMessage,
    handleNewChat,
    getAllContacts,
    getAllMessages,
    getCurrentTime,
} : MessageScreenProps) => {

    useEffect(() => {
        getAllContacts();
    }, [newChatOpen])

    return (
        <View className='flex-1 bg-secondary'> 
            {/* Conversation list */}
            <View className='relative flex-1'>
                {openConversations.size > 0 ? (
                    <FlatList
                        data={Array.from(openConversations.entries())}
                        keyExtractor={(item) => item[0].toString()}
                        renderItem={({item}) => {
                            const [conversationId, messageData] = item;
                            let time = messageData.message_time;
                            let message = messageData.last_message;
                            return (
                                <TouchableOpacity 
                                    className='flex-row items-center w-full h-20 px-4'
                                    onPress={() => {
                                        setCurrentConversation(conversationId); 
                                        setConversationPartner(messageData.user_id); 
                                        getAllMessages(conversationId); 
                                        setChatOpen(true);
                                        zeroUnreadMessages(conversationId, userId!);
                                    }}
                                >
                                    <View className='flex justify-center items-center h-14 w-14 rounded-[100%] bg-secondary-two'>
                                        <Image source={require('@/assets/icons/user.png')} resizeMode='contain' className='h-8 w-8' style={{tintColor:"#64748b"}}/>
                                    </View>
                                    <View className='flex justify-center h-14 ml-4 flex-1'>
                                        <View className='flex-row justify-between'>
                                            <Text className='font-staatliches text-white text-lg'>{messageData.user_id}</Text>
                                            <Text className='font-oswald-extralight' style={messageData.unread_messages > 0 ? {color: color} : {color: "#64748b"}}>
                                                {time ? getCurrentTime(time) : ""}
                                            </Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className='font-oswald-extralight text-slate-500' numberOfLines={1}>{message ? message : ""}</Text>
                                            {messageData.unread_messages > 0 && (
                                                <View className="flex justify-center items-center h-5 w-5 rounded-full" style={{backgroundColor: color}}>
                                                    <Text className="font-staatliches text-white leading-5">{messageData.unread_messages}</Text>
                                                </View>
                                            )}
                                        </View>
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
                {/* New chat selection */}
                <TouchableOpacity 
                    className='absolute flex justify-center items-center w-16 h-16 rounded-2xl right-5 bottom-5'
                    style={{backgroundColor: color}}
                    onPress={() => {setNewChatOpen(true);}}
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
                                    zeroUnreadMessages(currentConversation!, userId!);
                                    setConversationPartner(null); 
                                    setCurrentConversation(null); 
                                    setMessageList([]); 
                                    setChatOpen(false);
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
                                                    blockColor={color}
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
                                        onPress={() => handleSendMessage(currentConversation!, userId!, conversationPartner!, messageText)}
                                    >
                                        <View
                                            className='flex justify-center items-center h-12 w-12'
                                            style={{backgroundColor: color}}
                                        >
                                            <Image source={require('@/assets/icons/send.png')} className='h-6 w-6'/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* New chat screen */}
            <Modal
                visible={newChatOpen}
                transparent
                animationType='slide'
            >
                <SafeAreaView className='flex flex-1 bg-secondary'>
                    <View className='w-full h-full'>
                        {/* New chat header */}
                        <View className='flex-row items-center h-16 px-4 bg-secondary'>
                            <TouchableOpacity 
                                className='h-8 w-8 mr-4'
                                onPress={() => {
                                    setNewChatOpen(false);
                                }}
                            >
                                <Image source={require("@/assets/icons/arrow-left.png")} resizeMode='contain' style={{tintColor:'white'}} className='h-8 w-8'/>
                            </TouchableOpacity>
                            <Text className='font-staatliches text-white text-xl ml-4'>Select Contact</Text>
                        </View>
                        <View className='w-[95%] h-[2px] self-center rounded-2xl bg-white'/>
                        <View className="ml-4 mt-4">
                            <Text className="font-staatliches text-slate-400 text-lg">Contacts on Childway</Text>
                        </View>
                        {/* List of contacts */}
                        <FlatList
                            data={contacts}
                            renderItem={({item}) => (
                                <TouchableOpacity className="flex-row items-center h-20 w-full px-4" onPress={() => handleNewChat(item.contactId)}>
                                    <View className='flex justify-center items-center h-14 w-14 rounded-[100%] bg-secondary-two'>
                                        <Image source={require('@/assets/icons/user.png')} resizeMode='contain' className='h-8 w-8' style={{tintColor:"#64748b"}}/>
                                    </View>
                                    <Text className="font-staatliches text-white ml-4 text-lg">{item.contactId}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

export default MessagesScreen