import { getSocket } from '@/services/socket'
import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth.store';

export const useMessages = () => {
    const socket = getSocket();
    // types
    type conversationProps = {
        last_message: string,
        message_time: string,
        unread_messages: number,
        user_id: string
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
    const [openConversations, setOpenConversations] = useState<Map<number, conversationProps>>(new Map());
    const [contacts, setContacts] = useState<contactProps[] | []>([]);
    const [currentConversation, setCurrentConversation] = useState<number | null>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false); 
    const [chatOpen, setChatOpen] = useState(false);
    const [conversationPartner, setConversationPartner] = useState<string | null>(null);
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Auth states
    const userId = useAuthStore((state) => state.username);
    const userType = useAuthStore((state) => state.userType);

    // Grab current time in 12 hour format
    const getCurrentTime = (timestamp: string) => {
        const time = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return time;
    }

    // Update last message and time
    const updateLastMessage = async (message: string, conversationId: number) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/update-last-message`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({message, conversationId})
        })

        const data = await res.json();

        if (res.ok) {
            // Update open conversations to show on UI
            setOpenConversations((prev) => {
                // Create map from sorted array
                let updated = new Map(prev);
                // Check that conversation exists
                const conversation = updated.get(conversationId);
                if (!conversation) return prev;
                // Update map entry with new message and time
                updated.set(conversationId, {
                    ...conversation,
                    last_message: message,
                    message_time: new Date().toISOString()
                });
                // Re order conversations to have latest at top
                const sorted = Array.from(updated.entries()).sort(
                    (a,b) => 
                        new Date(b[1].message_time).getTime() -
                        new Date(a[1].message_time).getTime()
                )

                return new Map(sorted);
            })
        } else  {
            console.log("Error updating last message", data.error);
        }
    }

    // Set unread messages to zero
    const zeroUnreadMessages = async (conversationId: number, userId: string) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/zero-unread-messages`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({conversationId, userId})
        });

        const data = await res.json();

        if (res.ok) {
            setOpenConversations((prev) => {
                let updated = new Map(prev);

                const conversation = updated.get(conversationId);
                if (!conversation) return updated;

                updated.set(conversationId, {
                    ...conversation,
                    unread_messages: 0
                });

                return updated;
            })
        } else {
            console.log("Error zeroing unread count:", data.error);
        }
    }

    // Increase unread messages by one
    const increaseUnreadMessages = async (conversationId: number, userId: string) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/increase-unread-messages`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({conversationId, userId})
        })

        const data = await res.json();

        if (!res.ok) {
            console.log("Error increasing unread count:", data.error);
        }
    }

    // Send message notification
    const sendMessageNotification = async (sender: string, conversationPartner: string, text: string) => {
        const title = sender;
        const body = text;
        const role = userType === "parent" ? "child" : "parent";
        const data = {
            type: "message",
            sender: sender,
            recipientType: role
        };
        const recipient = conversationPartner;

        try {
            const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/pushTokens/send-message`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({recipient, title, body, data})
            })
    
            const data_ = await res.json();

            if (!res.ok) {
                console.log("Error sending message notification:", data_.error);
            } 
        } catch (error) {
            console.log("Error sending message notification:", error);
        }
    }

    // Logic when sending a message
    const handleSendMessage = async (conversationId: number, sender: string, conversationPartner: string, text: string) => {
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
        sendMessageNotification(sender, conversationPartner, text);
        setMessageText("");
        // Update last message
        updateLastMessage(text, conversationId);
        // Update unread messages
        increaseUnreadMessages(conversationId, conversationPartner);
        // Send message through socket
        if (socket) {
            socket.emit("send_message", {conversationId, sender, conversationPartner, text, createdAt});
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

    // Get all conversations for this specific user
    const getAllConversations = async () => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/get-all-conversations/${userId}`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"}
        })

        const data = await res.json();

        if (res.ok) {
            setOpenConversations(new Map(
                data.conversations.map((conversation: {conversation_id: number, last_message: string, message_time: string, unread_messages: number, user_id: string}) => [
                    conversation.conversation_id, {
                        last_message: conversation.last_message,
                        message_time: conversation.message_time,
                        unread_messages: conversation.unread_messages,
                        user_id: conversation.user_id
                    }
                ])
            ));
        }
    } 

    // Add a conversation participant to database
    const addParticipant = async (conversationId: number, userId: string | null) => {
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/add-participant`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({conversationId, userId})
        });

        const data = await res.json();

        if (res.ok) {
            console.log("Successfully added", userId, "to conversation", conversationId);
        } else {
            console.log("Error adding conversation participant:", data.error);
        }
    }

    // handles a new conversation being opened
    const handleNewChat = async (conversationPartner: string) => {
        // Attempt to create conversation
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5001/api/conversations/create-conversation`, {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({type: 'direct', cp1: userId, cp2: conversationPartner})
        });

        const data = await res.json();

        if (res.ok) {
            const conversationId = data.conversationId;
            setCurrentConversation(conversationId);
            setConversationPartner(conversationPartner);
            if (data.success) {
                // conversation doesn't already exist
                addParticipant(conversationId, userId);
                addParticipant(conversationId, conversationPartner);
                const newConversation: conversationProps = {last_message:"", message_time:"", unread_messages: 0, user_id: conversationPartner};
                setOpenConversations((prev) => {
                    let updated = new Map(prev);

                    updated.set(conversationId, newConversation);
                    
                    return updated;
                })
            } else {
                // conversation already exists
                console.log("Conversation already created");
            }
            setNewChatOpen(false);
            getAllMessages(conversationId);
            setChatOpen(true);
        } else {
            console.log("Error adding new chat:", data.error);
        }
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

    }, [currentConversation]) ;

    // On page render
    useFocusEffect(
        useCallback(() => {
            getAllConversations();
            if (!socket) {
                console.log("no socket");
                return;
            }
            // Open own room to get live updates
            socket.emit("open_self");

            const conversationHandler = (data: {conversationId: number, text: string, createdAt: string}) => {
                setOpenConversations((prev) => {
                    let updated = new Map(prev);
                    // Check that conversation exists
                    const conversation = updated.get(data.conversationId);
                    if (!conversation) return updated;
                    // Update conversation
                    updated.set(data.conversationId, {
                        ...conversation,
                        last_message: data.text,
                        message_time: data.createdAt,
                        unread_messages: (conversation.unread_messages ?? 0) + 1
                    });
                    // Sort conversations to have latest  at top
                    const sorted = Array.from(updated.entries()).sort(
                        (a,b) => 
                            new Date(b[1].message_time).getTime() -
                            new Date(a[1].message_time).getTime()
                    )

                    return new Map(sorted);
                });
            }

            socket.on("conversation_update", conversationHandler);

            return () => {
                socket.off("conversation_update", conversationHandler);
                socket.emit("close_self");
            };
        }, [socket])
    );

    useEffect(() => {
        const onShow = Keyboard.addListener('keyboardDidShow', () => {setKeyboardVisible(true)});
        const onHide = Keyboard.addListener('keyboardDidHide', () => {setKeyboardVisible(false)});

        return () => {onShow.remove(); onHide.remove()}
    }, []);

    return {
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
        unreadMessages, 
        setUnreadMessages,
        zeroUnreadMessages,
        handleSendMessage,
        handleNewChat,
        getCurrentTime,
        getAllMessages, 
        getAllConversations,
    };
}