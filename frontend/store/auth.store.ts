import { create } from "zustand"

type AuthState = {
    username: string | null
    name: string | null
    userType: string | null
    email: string | null
    token: string | null
    login: (username:string, token:string) => void
    logout: () => void
    setUsername: (username: string) => void
    setName: (name: string) => void
    setEmail: (email: string) => void
    setRole: (userType:string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    username: "",
    name: "",
    userType: "",
    email: "",
    token: "",
    login: (username, token) => {set({username, token})},
    logout: () => {
        set({username:null, name: null, token:null, userType:null, email: null})
    },
    setUsername: (username) => {set({username})},
    setName: (name) => {set({name})},
    setEmail: (email) => {set({email})},
    setRole: (userType) => {set({userType})}
}))