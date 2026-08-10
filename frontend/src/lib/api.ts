import axios from 'axios'
import {useAuthStore} from "../store/auth-store.ts";

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

//USER

export const changeUserCurrency = (code: string) => axios.put(
    `http://localhost:8080/api/user/${code}`,
    {},
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

//CURRENCY

export const getExchangeRate = (from: string, to: string) => axios.get(
    `http://localhost:8080/api/currency/exchange-rate/${from}/${to}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

//EXPENSES

export const getAllCategoriesAmount = (
    type: string,
    startDate: string,
    endDate: string,
) => axios.get(
    `http://localhost:8080/api/transactions/categories/type/${type}`,
    {
        params: {
            startDate: startDate,
            endDate: endDate,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getTransactionOverview = (
    type: string,
    startDate: string | null,
    endDate: string | null,
) => axios.get(
    `http://localhost:8080/api/transactions/overview/type/${type}`,
    {
        params: {
            startDate: startDate,
            endDate: endDate,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getMonthlyOverview = (startDate: string, endDate: string) => axios.get(
    `http://localhost:8080/api/transactions/overview/monthly`,
    {
        params: {
            startDate: startDate,
            endDate: endDate,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getTopExpenses = (startDate: string, endDate: string, limit: number, type: string) => axios.get(
    `http://localhost:8080/api/transactions/overview/top`,
    {
        params: {
            startDate: startDate,
            endDate: endDate,
            limit: limit,
            type: type,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)

export const getDailyOverview = (startDate: string, endDate: string, type: string) => axios.get(
    `http://localhost:8080/api/transactions/overview/daily`,
    {
        params: {
            startDate: startDate,
            endDate: endDate,
            type: type
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

// ACCOUNTS

export const transferBetweenAccounts = (transferDto: TransferDto) => axios.put(
    `http://localhost:8080/api/account/transfer`,
    transferDto,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getUserBalance = () => axios.get(
    'http://localhost:8080/api/account/balance',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

// CURRENCIES

export const getCurrencies = () => axios.get(
    'http://localhost:8080/api/currency',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

// RECOMMENDATIONS

export const getSmartRecommendations = () => axios.get(
    'http://localhost:8080/api/recommendation/smart',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
);

export const getSpendingAuditor = () => api.get(
    'http://localhost:8080/api/recommendation/auditor',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
);

export const getGoalAccelerator = () => api.get(
    'http://localhost:8080/api/recommendation/goal-accelerator',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
);