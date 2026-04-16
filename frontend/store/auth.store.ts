import { create } from "zustand"

type AuthState = {
    username: String | null
    userType: String | null
    token: String | null
    login: (username:String, token:String) => void
    logout: () => void
    setRole: (userType:String) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    username: "",
    userType: "",
    token: "",
    login: (username, token) => {set({username, token})},
    logout: () => {
        set({username:null, token:null, userType:null})
    },
    setRole: (userType) => {set({userType})}
}))