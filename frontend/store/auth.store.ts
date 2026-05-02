import { create } from "zustand"

type AuthState = {
    username: string | null
    userType: string | null
    token: string | null
    login: (username:string, token:string) => void
    logout: () => void
    setRole: (userType:string) => void
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