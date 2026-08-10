import {create} from "zustand";
import type {FinancialGoal} from "../types/budget.ts";
import {persist} from "zustand/middleware";

interface GoalStore {
    goals: FinancialGoal[],
    setGoals: (goals: FinancialGoal[]) => void,
    addGoal: (goal: FinancialGoal) => void,
    updateGoal: (goal: FinancialGoal) => void,
}

export const useGoalStore = create<GoalStore>()(
    persist((set) => ({
            goals: [],

            setGoals: (goals: FinancialGoal[]) => set({goals: goals}),

            addGoal: (goal: FinancialGoal) => set((prev) => ({
                goals: [...prev.goals, goal]
            })),

            updateGoal: (goal: FinancialGoal) => set((prev) => ({
                goals: prev.goals.map(
                    (g) => g.id === goal.id ? goal : g
                )
            }))
        }),
        {name: 'financemate-goals'}
    )
)