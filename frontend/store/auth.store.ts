import { create } from "zustand"

type AuthState = {
    username: String | null
    userType: String | null
    token: String | null
    login: (username:String, token:String) => void
    logout: () => void
    setType: (userType:String) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    username: "ravilez",
    userType: "child",
    token: "",
    login: (username, token) => {set({username, token})},
    logout: () => {
        set({username:null, token:null, userType:null})
    },
    setType: (userType) => {set({userType})}
}))