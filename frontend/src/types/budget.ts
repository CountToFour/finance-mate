import type {TFunction} from "i18next";

interface BudgetDtoBase {
    limitAmount: number;
    startDate?: string;
    endDate?: string;
}

export interface BudgetDto extends BudgetDtoBase {
    categoryId: string;
}

export interface Budget {
    id: string;
    limitAmount: number;
    spentAmount: number;
    active: boolean;
    startDate?: string;
    endDate?: string;
    categoryName: string;
}

export interface UpdateBudgetDto extends BudgetDtoBase {
}

export type PeriodContribution = 'WEEKLY' | 'MONTHLY'

export const getContributionPeriodTypes = (t: TFunction): Record<PeriodContribution, string> => ({
    WEEKLY: t('goal.dialog.add.periodContribution.weekly'),
    MONTHLY: t('goal.dialog.add.periodContribution.monthly'),
})

interface FinancialGoalBase {
    name: string;
    targetAmount: number;
    contribution: number;
    lockedFunds: boolean;
    deadline?: string;
    periodContribution?: PeriodContribution;
    accountId?: string;
}

export interface FinancialGoalDto extends FinancialGoalBase {
    initialAmount: number;
}
export interface FinancialGoal extends FinancialGoalBase {
    id: string;
    currentAmount: number;
    completed: boolean;
    nextContribution: string;
}
