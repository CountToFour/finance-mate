import { create } from "zustand";
import type {RecurringTransaction} from "../types/transaction.ts";
import {persist} from "zustand/middleware";

interface RecurringTransactionStore {
    recurringExpenses: RecurringTransaction[],
    recurringIncomes: RecurringTransaction[],
    setRecurringExpenses: (expenses: RecurringTransaction[]) => void,
    setRecurringIncomes: (incomes: RecurringTransaction[]) => void,
    deleteTransaction: (transaction: RecurringTransaction) => void,
    update: (transaction: RecurringTransaction) => void,
}

export const useRecurringTransactionStore = create<RecurringTransactionStore>()(
    persist(
        (set) => ({
            recurringExpenses: [],
            recurringIncomes: [],

            setRecurringExpenses: (expenses: RecurringTransaction[]) => set({recurringExpenses: expenses}),

            setRecurringIncomes: (incomes: RecurringTransaction[]) => set({recurringIncomes: incomes}),

            deleteTransaction: (transaction: RecurringTransaction) => set((prev) => {
                if (transaction.transactionType === "EXPENSE") {
                    return {
                        recurringExpenses: prev.recurringExpenses.filter(
                            (t) => t.id !== transaction.id
                        ),
                    };
                }
                return {
                    recurringIncomes: prev.recurringIncomes.filter(
                        (t) => t.id !== transaction.id
                    ),
                };
            }),

            update: (transaction: RecurringTransaction) => set((prev) => {
                if (transaction.transactionType === "EXPENSE") {
                    return {
                        recurringExpenses: prev.recurringExpenses.map(
                            (t) => t.id === transaction.id ? transaction : t
                        )
                    };
                }
                return {
                    recurringIncomes: prev.recurringExpenses.map(
                        (t) => t.id === transaction.id ? transaction : t
                    )
                };
            })
        }),
        {name: 'financemate-recurring-transactions'}
    )
)