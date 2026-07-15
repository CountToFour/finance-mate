import { create } from "zustand";
import type {Transaction} from "../types/transaction.ts";
import {persist} from "zustand/middleware";

interface TransactionStore {
    expenses: Transaction[];
    incomes: Transaction[];
    setExpenses: (expenses: Transaction[]) => void;
    setIncomes: (incomes: Transaction[]) => void;
    deleteTransaction: (transaction: Transaction) => void;
}

export const useTransactionService = create<TransactionStore>()(
    persist((set) => ({
            expenses: [],
            incomes: [],

            setExpenses: (expenses: Transaction[]) => set({expenses: expenses}),

            setIncomes: (incomes: Transaction[]) => set({incomes: incomes}),

            deleteTransaction: (transaction: Transaction) => set((prev) => {
                if (transaction.transactionType === "EXPENSE") {
                    return {
                        expenses: prev.expenses.filter(
                            (t) => t.id !== transaction.id
                        ),
                    };
                }
                return {
                    incomes: prev.incomes.filter(
                        (t) => t.id !== transaction.id
                    ),
                };
            }),
        }),
        {name: 'financemate-transactions'}
    )
)