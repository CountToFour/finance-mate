import axios from 'axios'
import {useAuthStore} from "../store/auth.ts";
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: false,
})

api.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

export const login = (email: string, password: string ) => axios.post(
    'http://localhost:8080/api/auth/login',
    {
        email: email,
        password: password,
    }
)

export const register = (email: string, password: string, username: string) => axios.post(
    'http://localhost:8080/api/auth/register',
    {
        email: email,
        password: password,
        username: username
    }
)
