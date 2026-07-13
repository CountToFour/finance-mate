import type {EditTransactionDto, Transaction, TransactionDto, TransactionFilters} from "../types/transaction.ts";
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



}