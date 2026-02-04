import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Index = () => {
    return (
        <SafeAreaView> 
            <View style={{backgroundColor: 'red'}}>
                <Text>Home</Text>
            </View>
        </SafeAreaView>
    )
}

export default Index;