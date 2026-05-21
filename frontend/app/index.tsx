import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import * as SecureStore from 'expo-secure-store'
import {jwtDecode} from 'jwt-decode'
import { useAuthStore } from "@/store/auth.store";

type authToken = {
  userId: string,
  role: "parent" | "child",
  exp: number,
  iat: number
}

type appRoute = "/(auth)/login" | "/(childTabs)" | "/(parentTabs)";

export default function Index() {
  // use states
  const [route, setRoute] = useState<appRoute | null>(null);

  // auth store
  const setUsername = useAuthStore((state) => state.setUsername);
  const setName = useAuthStore((state) => state.setName);
  const setEmail = useAuthStore((state) => state.setEmail);
  const setRole = useAuthStore((state) => state.setRole);

  const refreshAccessToken = async () => {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/authTokens/refresh`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({refreshToken})
      });

      const data = await res.json();

      if (res.ok) {
        return data.accessToken;
      } else {
        console.log("Could not refresh access token:", data.error);
        return null;
      }
    } catch (error) {
      console.log("Could not refresh access token:", error);
    }
  }

  const checkIfExpired = (accessToken: string) => {
    try {
      const decoded = jwtDecode(accessToken);
      if (decoded.exp) {
        return decoded.exp * 1000 < Date.now();
      } else {
        return true;
      }
    } catch (error) {
      console.log("Error checking expiration:", error);
      return true;
    }
  }

  const grabUser = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/user/${userId}`, {
        method: "GET",
        headers: {"Content-Type" : "application/json"}
      });
  
      const data = await res.json();
  
      if (res.ok) {
        if (data.success) {
          return data.user; 
        } else {
          console.log("No user with that username");
          return null;
        }
      }

      console.log("Error fetching user:", data.error);
      return null;
    } catch (error) {
      console.log("Could not fetch user:", error);
    }
  }

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check for access token
        let accessToken = await SecureStore.getItemAsync("accessToken");
        if (!accessToken) {
          setRoute("/(auth)/login");
          return;
        }
        // Check if access token is expired
        const isExpired = checkIfExpired(accessToken);
        if (isExpired) {
          // Grab new access token
          accessToken = await refreshAccessToken();
          if (!accessToken) {
            setRoute("/(auth)/login");
            return;
          }
        }
        // Store new access token and route to interface
        await SecureStore.setItemAsync("accessToken", accessToken);
        const decoded = jwtDecode<authToken>(accessToken);
        // Rehydrate auth store before routing
        const user = await grabUser(decoded.userId);
        setUsername(user.username);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);

        setRoute(decoded.role === "child" ? "/(childTabs)" : "/(parentTabs)")
      } catch (error) {
        console.log("Error restoring session:", error);
        setRoute("/(auth)/login");
      }
    }
    restoreSession();
  }, []);

  if (!route) return null;

  return <Redirect href={route}/>
}