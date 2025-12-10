//USER

export type User = {
    id: string;
    email: string;
    username: string;
    currency: Currency;
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
    accountName: string
    category: string
    price: number
    description: string
    createdAt: string
}

export type Income = {
    id: string
    accountName: string
    category: string
    price: number
    description: string
    createdAt: string
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
    accountName: string
    category: string
    price: number
    description: string
    createdAt: string
    active: boolean
    periodType: string
}

export type RecurringIncome = {
    id: string
    accountName: string
    category: string
    price: number
    description: string
    createdAt: string
    active: boolean
    periodType: string
}

export type CategoryAmount = {
    category: string
    amount: number
    transactions: number
    percentage: number
}

export type TransactionOverview = {
    totalAmount: number
    averageAmount: number
    expenseCount: number
    totalAmountChangePercentage: number
    expenseCountChangePercentage: number
}

export type MonthlyOverview = {
    month: string
    totalIncome: number
    totalExpense: number
}

export type DailyOverview = {
    date: string;
    amount: number;
}

//ACCOUNTS

export type Account = {
    id: string
    name: string
    description?: string
    currency: Currency
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

export type BalanceResponse = {
    balance: number;
    currency: string;
}

//CATEGORY

export type CategoryGroup = 'NEEDS' | 'WANTS' | 'SAVINGS';

export type Category = {
    id: string
    name: string
    color: string
    parentId?: string | null
    transactionType: string
    categoryGroup?: CategoryGroup | null
}

export type CategoryDto = {
    name: string
    color: string
    parentId?: string | null
    transactionType: string
    categoryGroup?: CategoryGroup | null
}

// BUDGETS

export type BudgetDto = {
    categoryId: string
    limitAmount: number
    periodType: string
    startDate: string
    endDate: string
    // color: string
}

export type Budget = {
    id: string
    limitAmount: number
    spentAmount: number
    active: boolean
    periodType: string
    categoryName: string
    startDate: string
    endDate: string
}

export type FinancialGoal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    completed: boolean;
    lockedFunds: boolean;
    deadline: string;
}

export type CreateGoalDto = {
    name: string;
    targetAmount: number;
    initialAmount: number;
    lockedFunds: boolean;
    deadline: string;
    accountId: string;
}

// RECOMMENDATIONS

export type RecommendationAction = 'BUY' | 'SELL' | 'HOLD';

export type Recommendation = {
    id: string;
    symbol: string;
    rsiValue: number;
    action: RecommendationAction;
    latestClose: number;
    latestDatetime: string;
}

export type InvestmentProfile = 'CRITICAL' | 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export type SmartRecommendation = {
    profile: InvestmentProfile;
    savingsRate: number;
    recommendations: Recommendation[];
    message: string;
    safetyNetStatus: 'DANGER' | 'WARNING' | 'SAFE' | 'EXCELLENT';
    monthsOfSafety: number;
    forecastStatus: 'STABLE' | 'WARNING' | 'CRITICAL' | 'INSUFFICIENT_DATA';
    projectedBalanceEndOfMonth: number;
    dailySafeSpend: number;
    safetyMarginPercent: number;
}

export type SpendingStructure = {
    needsPercent: number;
    wantsPercent: number;
    savingsPercent: number;
    totalIncome: number;
    recommendation: string;
}

export type GoalRecommendation = {
    goalName: string;
    categoryToCut: string;
    monthlySavingsPotential: number;
    monthsFaster: number;
    message: string;
}

// CURRENCY

export type ExchangeRate = {
    base_code: string,
    target_code: string,
    conversion_rate: string
}

export type Currency = {
    code: string
    name: string
    symbol: string
}