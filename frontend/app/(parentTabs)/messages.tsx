import { Keyboard } from 'react-native'
import React, {useState, useCallback, useEffect} from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth.store';
import { getSocket } from '@/services/socket';
import { useMessages } from '@/hooks/useMessages';
import MessagesScreen from '@/components/MessagesScreen';

export default function messages() {
    // type
    type contactProps = {
        childId: string,
        profilePic: string
    }

    const socket = getSocket();
    
    const {
        messageList,
        setMessageList,
        messageText, 
        setMessageText,
        openConversations,
        setOpenConversations,
        contacts,
        setContacts,
        currentConversation,
        setCurrentConversation,
        keyboardVisible,
        setKeyboardVisible,
        chatOpen,
        setChatOpen,
        conversationPartner,
        setConversationPartner,
        newChatOpen,
        setNewChatOpen,
        getDateTime,
        zeroUnreadMessages,
        handleSendMessage,
        handleNewChat,
        getAllMessages, 
        getAllConversations
    } = useMessages();

    // Auth states
    const userId = useAuthStore((state) => state.username);

    const getAllContacts = async () => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/parentChildren/get-all-children/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        });

        const data = await res.json();

        if (res.ok) {
            setContacts(data.res.map((contact: contactProps) => (
                {contactId: contact.childId, profilePic: contact.profilePic}
            )));
        } else {
            console.log("Error getting contacts:", data.error);
        }
    }

    return (
        <MessagesScreen 
            socket={socket}
            openConversations={openConversations}
            currentConversation={currentConversation}
            keyboardVisible={keyboardVisible}
            messageList={messageList}
            messageText={messageText}
            contacts={contacts}
            chatOpen={chatOpen}
            conversationPartner={conversationPartner}
            newChatOpen={newChatOpen}
            setNewChatOpen={setNewChatOpen}
            userId={userId}
            color={'#FF6F52'}
            setMessageText={setMessageText}
            setCurrentConversation={setCurrentConversation}
            setMessageList={setMessageList}
            setContacts={setContacts}
            setChatOpen={setChatOpen}
            setConversationPartner={setConversationPartner}
            zeroUnreadMessages={zeroUnreadMessages}
            handleSendMessage={handleSendMessage}
            handleNewChat={handleNewChat}
            getAllContacts={getAllContacts}
            getAllMessages={getAllMessages}
            getDateTime={getDateTime}
        />
    )
}