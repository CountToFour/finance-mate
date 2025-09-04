import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {login} from "../lib/api.ts";
type User = { id: number; email: string } | null
type State = {
    accessToken: string | null
    refreshToken: string | null
    tokenType: string | null
    user: User
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
}
export const useAuthStore = create<State>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            tokenType: null,
            user: null,
            loading: false,
            error: null,
            async login(email, password) {
                try {
                    set({ loading: true, error: null })
                    const res = await login(email, password)
// Zakładamy odpowiedź: { token: string, user: { id, email } }
                    const { accessToken, refreshToken, tokenType } = res.data
                    set({ accessToken, refreshToken, tokenType, loading: false })
                    return true
                } catch (e: any) {
                    set({ error: e?.response?.data?.message || 'Błąd logowania',
                        loading: false })
                    return false
                }
            },
            logout() {
                set({ accessToken: null, refreshToken: null, tokenType:null })
            },
        }),
        { name: 'finmate-auth' }
    )
)
