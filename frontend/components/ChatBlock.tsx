import { View, Text } from 'react-native'
import React from 'react'

type ChatBlockProps = {
    isSending: boolean,
    message: string,
    time: string
}

export default function ChatBlock({isSending, message, time} : ChatBlockProps) {

    return (
        <View className={`relative h-auto mb-2 max-w-[80%] p-2 rounded-lg ${isSending ? 'bg-tertiary self-end mr-2' : 'bg-slate-800 self-start ml-2'}`}>
            <View className={`absolute top-0 h-3 w-3 ${isSending ? 'right-0 bg-tertiary' : 'left-0 bg-slate-800'}`}/>
            <View>
                <Text className='font-oswald-regular text-white'>{message}</Text>
                <Text className='self-end font-oswald-regular text-xs text-slate-500'>{time}</Text>
            </View>
        </View>
    )
}