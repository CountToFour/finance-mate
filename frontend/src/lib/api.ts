import axios from 'axios'
import {useAuthStore} from "../store/auth.ts";
import type {ExpenseDto} from "./types.ts";

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

export const login = (email: string, password: string) => axios.post(
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

//EXPENSES

export const getExpenses = (userId: string | undefined) => axios.get(
    `http://localhost:8080/api/expenses/${userId}`, {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const deleteExpense = (id: string) => axios.delete(
    `http://localhost:8080/api/expenses/${id}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const addExpense = (expense: ExpenseDto) => axios.post(
    'http://localhost:8080/api/expenses',
    expense,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)