import { SplashScreen, Stack } from "expo-router";

import './global.css'
import { SafeAreaProvider } from "react-native-safe-area-context";
import {useFonts} from 'expo-font'
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useNotifications } from "@/hooks/useNotifications";

import "../services/locationService"
import * as Location from 'expo-location'
import { LOCATION_TASK, startLocationTracking, stopLocationTracking } from "@/services/locationService";

export default function RootLayout() {
  // Set up fonts
  const [fontsLoaded, error] = useFonts({
    "Bungee-Regular": require("../assets/fonts/Bungee-Regular.ttf"),
    "CalSans-Regular": require("../assets/fonts/CalSans-Regular.ttf"),
    "Staatliches-Regular": require("../assets/fonts/Staatliches-Regular.ttf"),
    "Oswald-ExtraLight": require("../assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Light": require("../assets/fonts/Oswald-Light.ttf"),
    "Oswald-Medium": require("../assets/fonts/Oswald-Medium.ttf"),
    "Oswald-Regular": require("../assets/fonts/Oswald-Regular.ttf")
  })

  // Load fonts
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  
  // Socket connection
  const user = useAuthStore((state) => state.username);
  const userType = useAuthStore((state) => state.userType);
  useEffect(() => {
    if (!user || !userType) return;
    connectSocket(user, userType);
    return () => disconnectSocket(userType, user);
  }, [user])

  // Continuosly send location data
  useEffect(() => {
    // only send location if user is logged in and is a child
    const handleTracking = async () => {
      console.log("uername:", user);
      console.log("userType:", userType);
      if (user && userType === 'child') await startLocationTracking();
      else if (!user) await stopLocationTracking();
    }

    handleTracking();
  }, [user, userType])

  useNotifications(user);
  
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      {/* <StatusBar /> */}
      <Stack screenOptions={{headerShown: false}}/>
    </SafeAreaProvider>
  )
}
