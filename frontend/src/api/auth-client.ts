import type {LoginRequest, User, UserRegistration, UserUpdate} from "../types/auth.ts";
import api from "./api.ts";
import axios from "axios";

export const authService = {
    register: async (data: UserRegistration): Promise<void> => {
        const response = await axios.post(
            'http://localhost:8080/api/auth/register',
            data,
        );
        return response.data;
    },

    login: async (data: LoginRequest): Promise<void> => {
        const response = await axios.post(
            'http://localhost:8080/api/auth/login',
            data,
        );
        return response.data;
    },

    logout: async (): Promise<void> => {
        const response = await axios.post(
            'http://localhost:8080/api/auth/logout',
        );
        return response.data;
    },

    getUser: async (email: string): Promise<User> => {
        const response = await api.get(
            `/user/${email}`,
        );
        return response.data;
    },

    updateUser: async (userId: string, data: UserUpdate): Promise<void> => {
        const response = await api.put(
            `/user/${userId}`,
            data,
        );
        return response.data;
    }
}