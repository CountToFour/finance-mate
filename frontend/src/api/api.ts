import axios from 'axios';
import {useAuthStore} from "../store/auth-store.ts";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true
});

let isRefreshing = false;
let failedQueue: Array<() => void> = [];

const processQueue = () => {
    failedQueue.forEach(callback => callback());
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve) {
                    failedQueue.push(() => {
                        originalRequest._retry = true;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.warn('Sesja wygasła, próbuję odświeżyć token z ciasteczka...');

                await axios.post('http://localhost:8080/api/auth/refresh', {}, {
                    withCredentials: true
                });

                isRefreshing = false;

                processQueue();

                return api(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;
                failedQueue = [];
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;