import type {Budget} from "../types/budget.ts";
import {create} from "zustand";
import {persist} from "zustand/middleware";

interface BudgetStore {
    budgets: Budget[],
    setBudgets: (budgets: Budget[]) => void,
    addBudget: (budget: Budget) => void,
    deleteBudget: (budget: Budget) => void,
}

export const useBudgetStore = create<BudgetStore>()(
    persist((set) => ({
            budgets: [],

            setBudgets: (budgets: Budget[]) => set({budgets: budgets}),

            addBudget: (budget: Budget) => set((prev) => ({
                budgets: [...prev.budgets, budget]
            })),

            deleteBudget: (budget: Budget) => set((prev) => ({
                budgets: prev.budgets.filter((b) => b.id !== budget.id),
            }))
        }),
        {name: 'financemate-budgets'}
    )
)