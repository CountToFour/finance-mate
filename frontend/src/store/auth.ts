import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {login, register} from "../lib/api.ts";
import type {State} from "../lib/types.ts";

export const useAuthStore = create<State>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            tokenType: null,
            user: null,
            loading: false,
            error: null,
            async login(mail, password) {
                try {
                    set({ loading: true, error: null })
                    const res = await login(mail, password)
                    const { accessToken, refreshToken, tokenType, username, email} = res.data
                    set({ accessToken,
                        refreshToken,
                        tokenType,
                        user: { email, username },
                        loading: false })
                    return true
                } catch (e: any) {
                    set({ error: e?.response?.data?.message || 'Błąd logowania',
                        loading: false })
                    throw e
                }
            },
            async register(mail: string, password: string, name: string) {
                try {
                    set({ loading: true, error: null })
                    const res = await register(mail, password, name)
                    const { accessToken, refreshToken, tokenType, username, email} = res.data
                    set({ accessToken,
                        refreshToken,
                        tokenType,
                        user: { email, username },
                        loading: false })
                    return true
                } catch (e: any) {
                    set({ error: e?.response?.data?.message || 'Błąd rejestracji',
                        loading: false })
                    throw e
                }
            },
            logout() {
                set({ accessToken: null, refreshToken: null, tokenType: null, user: null })
            },
        }),
        { name: 'finmate-auth' }
    )
)
