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

export type Expense = {
    id: string
    userId: string
    category: string
    price: number
    description: string
    expenseDate: string
}

export type ExpenseDto = {
    userId: string | undefined
    category: string
    price: number
    description: string
    expenseDate: string
    periodType: "NONE"
}