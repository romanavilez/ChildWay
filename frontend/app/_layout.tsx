import { SplashScreen, Stack } from "expo-router";

import './global.css'
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StatusBar } from "react-native";
import {useFonts} from 'expo-font'
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Bungee-Regular": require("../assets/fonts/Bungee-Regular.ttf"),
    "CalSans-Regular": require("../assets/fonts/CalSans-Regular.ttf"),
    "Staatliches-Regular": require("../assets/fonts/Staatliches-Regular.ttf"),
    "Oswald-ExtraLight": require("../assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Light": require("../assets/fonts/Oswald-Light.ttf"),
    "Oswald-Medium": require("../assets/fonts/Oswald-Medium.ttf"),
    "Oswald-Regular": require("../assets/fonts/Oswald-Regular.ttf")
  })

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      {/* <StatusBar /> */}
      <Stack screenOptions={{headerShown: false}}/>
    </SafeAreaProvider>
  )
}
