//USER

export type User = {
    id: string;
    email: string;
    username: string;
}

export type State = {
    accessToken: string | null
    refreshToken: string | null
    tokenType: string | null
    user: User | null
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, username: string) => Promise<boolean>
    logout: () => void
}

//EXPENSES

export type Expense = {
    id: string
    userId: string
    category: string
    price: number
    description: string
    expenseDate: string
}

export type TransactionDto = {
    accountId: string
    categoryId: string
    price: number
    description: string | null
    createdAt: string
    periodType: string
    transactionType: string
    active: boolean
}

export type EditTransactionDto = {
    accountId: string
    categoryId: string
    price: number
    description: string | null
    createdAt: string
    periodType: string
}

export type RecurringExpense = {
    id: string
    userId: string
    category: string
    price: number
    description: string
    expenseDate: string
    active: boolean
    periodType: string
}

export type CategoryAmount = {
    category: string
    amount: number
    transactions: number
    percentage: number
}

export type ExpenseOverview = {
    totalAmount: number
    averageAmount: number
    expenseCount: number
    totalAmountChangePercentage: number
    expenseCountChangePercentage: number
}

//ACCOUNTS

export type Account = {
    id: string
    name: string
    description?: string
    currencySymbol: string
    balance: number
    color: string
    includeInStats: boolean
    archived?: boolean
}

export type CreateAccountDto = {
    name: string
    description?: string | null
    currencyCode: string
    balance: number
    color?: string
}

export type TransferDto = {
    fromAccountId: string
    toAccountId: string
    amount: number
}

export type Currency = {
    code: string
    name: string
    symbol: string
}
