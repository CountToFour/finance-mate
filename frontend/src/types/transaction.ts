import type {TFunction} from "i18next";

export type PeriodType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER'

export const getPeriodTypes = (t: TFunction): Record<PeriodType, string> => ({
    NONE: t('transactions.period.none'),
    DAILY: t('transactions.period.daily'),
    WEEKLY: t('transactions.period.weekly'),
    MONTHLY: t('transactions.period.monthly'),
    YEARLY: t('transactions.period.yearly'),
})

interface TransactionBase {
    price: number
    description: string | null
    createdAt: string
    transactionType: TransactionType
}

export interface TransactionDto extends TransactionBase {
    accountId: string
    categoryId: string
    periodType: PeriodType
}

export interface Transaction extends TransactionBase {
    id: string
    accountName: string
    categoryName: string
}

export interface EditTransactionDto {
    price: number | null
    description: string | null
    createdAt: string | null
    accountId: string | null
    categoryId: string | null
    periodType: PeriodType
}

export interface RecurringTransaction extends TransactionBase {
    id: string
    accountName: string
    categoryName: string
    periodType: PeriodType
    active: boolean
}

export interface TransactionFilters {
    type?: TransactionType
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    accountName?: string;
}

export interface TransactionsOverview {
    totalValue: number;
    totalAmount: number;
    totalValuePercentageChange: number;
    totalAmountPercentageChange: number;
    dailyAverage: number;
}

export interface OverviewFilter {
    type?: TransactionType,
    startDate: string;
    endDate: string;
}