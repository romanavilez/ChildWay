import { getSocket } from '@/services/socket'
import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth.store';

export const useMessages = () => {
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

    type contactProps = {
        contactId: string
    }

    // Use states
    const [messageList, setMessageList] = useState<{
        conversation_id: number,
        sender_id: string,
        message_text: string, 
        created_at: string
    }[]>([]);
    const [messageText, setMessageText] = useState("");
    const [openConversations, setOpenConversations] = useState<conversationProps[] | []>([]);
    const [lastMessages, setLastMessages] = useState<Map<number, lastMessagesProps>>(new Map());
    const [contacts, setContacts] = useState<contactProps[] | []>([]);
    const [currentConversation, setCurrentConversation] = useState<number | null>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false); 

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
    }, [openConversations, messageList])

    useEffect(() => {
        const onShow = Keyboard.addListener('keyboardDidShow', () => {setKeyboardVisible(true)});
        const onHide = Keyboard.addListener('keyboardDidHide', () => {setKeyboardVisible(false)});

        return () => {onShow.remove(); onHide.remove()}
    }, [])

    return {
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
    };
}