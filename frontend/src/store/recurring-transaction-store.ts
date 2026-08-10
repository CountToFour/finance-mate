import { create } from "zustand";
import type {RecurringTransaction} from "../types/transaction.ts";
import {persist} from "zustand/middleware";

interface RecurringTransactionStore {
    recurringTransactions: RecurringTransaction[],
    setRecurringTransactions: (transactions: RecurringTransaction[]) => void,
    addTransaction: (transaction: RecurringTransaction) => void,
    deleteTransaction: (transaction: RecurringTransaction) => void,
    update: (transaction: RecurringTransaction) => void,
}

export const useRecurringTransactionStore = create<RecurringTransactionStore>()(
    persist(
        (set) => ({
            recurringTransactions: [],

            setRecurringTransactions: (transactions: RecurringTransaction[]) => set({recurringTransactions: transactions}),

            addTransaction: (transaction: RecurringTransaction) => set((prev) => ({
                recurringTransactions: [...prev.recurringTransactions, transaction],
            })),

            deleteTransaction: (transaction: RecurringTransaction) => set((prev) => ({
                    recurringTransactions: prev.recurringTransactions.filter((t) => t.id !== transaction.id),
            })),

            update: (transaction: RecurringTransaction) => set((prev) => ({
                recurringTransactions: prev.recurringTransactions.map(
                    (t) => t.id === transaction.id ? transaction : t
                )
            })),
        }),
        {name: 'financemate-recurring-transactions'}
    )
)