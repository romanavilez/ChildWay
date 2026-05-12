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
        child_id: string
    }

    const socket = getSocket();
    
    const {
        messageList,
        setMessageList,
        messageText, 
        setMessageText,
        openConversations,
        setOpenConversations,
        lastMessages, 
        setLastMessages,
        contacts,
        setContacts,
        currentConversation,
        setCurrentConversation,
        keyboardVisible,
        setKeyboardVisible,
        getCurrentTime,
        handleSendMessage,
        getAllMessages, 
        getLastMessage,
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
                {contactId: contact.child_id}
            )));
            console.log("Get all contacts:", data.res);
        } else {
            console.log("Error getting contacts:", data.error);
        }
    }

    return (
        <MessagesScreen 
            socket={socket}
            openConversations={openConversations}
            lastMessages={lastMessages}
            currentConversation={currentConversation}
            keyboardVisible={keyboardVisible}
            messageList={messageList}
            messageText={messageText}
            contacts={contacts}
            userId={userId}
            color={'#FF6F52'}
            setMessageText={setMessageText}
            setCurrentConversation={setCurrentConversation}
            setMessageList={setMessageList}
            setContacts={setContacts}
            getAllContacts={getAllContacts}
            getAllMessages={getAllMessages}
            getCurrentTime={getCurrentTime}
            handleSendMessage={handleSendMessage}
        />
    )
}