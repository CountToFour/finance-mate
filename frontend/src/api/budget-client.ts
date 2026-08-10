import type {Budget, BudgetDto, FinancialGoal, FinancialGoalDto, UpdateBudgetDto} from "../types/budget.ts";
import api from "./api.ts";

export const budgetService = {
    createBudget: async (data: BudgetDto): Promise<Budget> => {
        const response = await api.post<Budget>(
            `/budgets`,
            data,
        )
        return response.data
    },

    getBudgets: async (): Promise<Budget[]> => {
        const response = await api.get<Budget[]>(
            `/budgets`
        )
        return response.data
    },

    updateBudget: async (id: string, data: UpdateBudgetDto): Promise<Budget> => {
        const response = await api.put<Budget>(
            `/budgets/${id}`,
            data
        )
        return response.data
    },

    deleteBudget: async (id: string): Promise<void> => {
        const response = await api.delete<void>(
            `/budgets/${id}`,
        )
        return response.data
    },

    createGoal: async (data: FinancialGoalDto): Promise<FinancialGoal> => {
        const response = await api.post<FinancialGoal>(
            `/goals`,
            data
        )
        return response.data
    },

    getGoals: async (): Promise<FinancialGoal[]> => {
        const response = await api.get<FinancialGoal[]>(
            `/goals`
        )
        return response.data
    },

    deposit: async (id: string, amount: number, accountId: string): Promise<FinancialGoal> => {
        const response = await api.patch<FinancialGoal>(
            `/goals/${id}/deposit`,
            null,
            {
                params: {
                    amount: amount,
                    accountId: accountId,
                },
            }
        )
        return response.data
    },

    withdraw: async (id: string, amount: number, accountId: string): Promise<FinancialGoal> => {
        const response = await api.patch<FinancialGoal>(
            `/goals/${id}/withdraw`, {
                params: {
                    amount: amount,
                    accountId: accountId,
                },
            }
        )
        return response.data
    },
}