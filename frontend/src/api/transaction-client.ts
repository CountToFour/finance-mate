import type {
    EditTransactionDto, RecurringTransaction,
    Transaction,
    TransactionDto,
    TransactionFilters,
} from "../types/transaction.ts";
import api from "./api.ts";

export const transactionService = {
    addTransaction: async(data: TransactionDto): Promise<Transaction> => {
        const response = await api.post<Transaction>(
            `/transactions`,
            data
        )
        return response.data
    },

    getTransactions: async(filters: TransactionFilters): Promise<Transaction[]> => {
        const response = await api.get<Transaction[]>(
            `/transactions`,
            {
                params: filters
            }
        )
        return response.data
    },

    deleteTransaction: async(id: string): Promise<void> => {
        const response = await api.delete<void>(
            `/transactions/${id}`,
        )
        return response.data
    },

    editTransaction: async(id: string, data: EditTransactionDto): Promise<Transaction> => {
        const response = await api.put<Transaction>(
            `/transactions/edit/${id}`,
            data
        )
        return response.data
    },

    addRecurringTransaction: async(data: TransactionDto): Promise<RecurringTransaction> => {
        const response = await api.post<RecurringTransaction>(
            `/transactions/recurring`,
            data
        )
        return response.data
    },

    getRecurringTransactions: async(): Promise<RecurringTransaction[]> => {
        const response = await api.get<RecurringTransaction[]>(
            `/transactions/recurring`,
        )
        return response.data
    },

    deleteRecurringTransaction: async(id: string): Promise<void> => {
        const response = await api.delete<void>(
            `/transactions/recurring/${id}`
        )
        return response.data
    },

    deactivateTransaction: async(id: string): Promise<void> => {
        const response = await api.put<void>(
            `/transactions/recurring/deactivate/${id}`
        )
        return response.data
    },

    editRecurringTransaction: async(id: string, data: EditTransactionDto): Promise<RecurringTransaction> => {
        const response = await api.put<RecurringTransaction>(
            `/transactions/recurring/edit/${id}`,
            data
        )
        return response.data
    }
}