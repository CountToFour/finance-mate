import axios from 'axios'
import {useAuthStore} from "../store/auth.ts";
import type {EditTransactionDto, TransactionDto, CreateAccountDto, TransferDto, BudgetDto, CategoryDto} from "./types.ts";

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

export const getExpenses = (
    category: string | null,
    startDate: string,
    endDate: string,
) => axios.get(
    `http://localhost:8080/api/transactions`,
    {
        params: {
            type: 'EXPENSE',
            category: category,
            startDate: startDate,
            endDate: endDate,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getTransactions = (
    type: string,
    category: string | null,
    startDate: string,
    endDate: string,
) => axios.get(
    `http://localhost:8080/api/transactions`,
    {
        params: {
            type: type,
            category: category,
            startDate: startDate,
            endDate: endDate,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getAllRecurringExpenses = () => axios.get(
    `http://localhost:8080/api/transactions/recurring`,
    {
        params : {
            type: 'EXPENSE',
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    })

export const getAllRecurringTransactions = (type: string) => axios.get(
    `http://localhost:8080/api/transactions/recurring`,
    {
        params : {
            type: type,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    })


export const deleteTransaction = (id: string) => axios.delete(
    `http://localhost:8080/api/transactions/${id}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const deleteRecurringTransaction = (id: string) => axios.delete(
    `http://localhost:8080/api/transactions/recurring/${id}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const addTransaction = (transaction: TransactionDto) => axios.post(
    'http://localhost:8080/api/transactions',
    transaction,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const addRecurringTransaction = (transaction: TransactionDto) => axios.post(
    'http://localhost:8080/api/transactions/recurring',
    transaction,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const editExpense = (id: string, transaction: EditTransactionDto) => axios.put(
    `http://localhost:8080/api/transactions/edit/${id}`,
    transaction,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

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

export const deactivateRecurringTransaction = (id: string) => axios.put(
    `http://localhost:8080/api/transactions/deactivate/${id}`,
    {},
    {
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

// ACCOUNTS

export const getAccounts = () => axios.get(
    'http://localhost:8080/api/account',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const createAccount = (account: CreateAccountDto) => axios.post(
    'http://localhost:8080/api/account/create',
    account,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const updateAccount = (account: CreateAccountDto, accountId: string) => axios.put(
    `http://localhost:8080/api/account/update/${accountId}`,
    account,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const deleteAccount = (accountId: string) => axios.delete(
    `http://localhost:8080/api/account/delete/${accountId}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const archiveAccount = (accountId: string) => axios.put(
    `http://localhost:8080/api/account/archive/${accountId}`,
    {},
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const includeInStatsAccount = (accountId: string) => axios.put(
    `http://localhost:8080/api/account/include-in-stats/${accountId}`,
    {},
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

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

// CATEGORIES

export const getCategories = (transactionType: string) => axios.get(
    'http://localhost:8080/api/categories',
    {
        params: {
            type: transactionType,
        },
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const createCategory = (categoryDto: CategoryDto) => axios.post(
    'http://localhost:8080/api/categories',
    categoryDto,
    {
        withCredentials: true,
        headers: {
             Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const updateCategory = (categoryDto: CategoryDto, id: string) => axios.put(
    `http://localhost:8080/api/categories/${id}`,
    categoryDto,
    {
        withCredentials: true,
        headers: {
             Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const deleteCategory = (id: string) => axios.delete(
    `http://localhost:8080/api/categories/${id}`,
    {
        withCredentials: true,
        headers: {
             Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

// BUDGETS

export const createBudget = (budgetDto: BudgetDto) => axios.post(
    'http://localhost:8080/api/budgets',
    budgetDto,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        },
    }
)

export const getBudgets = () => axios.get(
    'http://localhost:8080/api/budgets',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)

export const getBudgetById = (id: string) => axios.get(
    `http://localhost:8080/api/budgets/${id}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)

export const updateBudget = (budgetDto: BudgetDto, id: string) => axios.put(
    `http://localhost:8080/api/budgets/${id}`,
    budgetDto,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)

export const deleteBudget = (id: string) => axios.delete(
    `http://localhost:8080/api/budgets/${id}`,
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)

// RECOMMENDATIONS

export const getRecommendations = () => axios.get(
    'http://localhost:8080/api/investments/recommendations',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
)        

export const getSmartRecommendations = () => axios.get(
    'http://localhost:8080/api/recommendation/smart',
    {
        withCredentials: true,
        headers: {
            Authorization: 'Bearer ' + useAuthStore.getState().accessToken,
        }
    }
);