import { create } from "zustand";
import type {Transaction} from "../types/transaction.ts";
import {persist} from "zustand/middleware";

interface TransactionStore {
    transactions: Transaction[];
    setTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    editTransaction: (transaction: Transaction) => void;
    deleteTransaction: (transaction: Transaction) => void;
}

export const useTransactionStore = create<TransactionStore>()(
    persist((set) => ({
            transactions: [],

            setTransactions: (transactions: Transaction[]) => set({transactions: transactions}),

            addTransaction: (transaction: Transaction) => set((prev) => ({
                transactions: [...prev.transactions, transaction],
            })),

            editTransaction: (transaction: Transaction) => set((prev) => ({
                transactions: prev.transactions.map(
                    (t) => t.id === transaction.id ? transaction : t,
                )
            })),

            deleteTransaction: (transaction: Transaction) => set((prev) => ({
                transactions: prev.transactions.filter(t => t.id !== transaction.id)
            })),
        }),
        {name: 'financemate-transactions'}
    )
)