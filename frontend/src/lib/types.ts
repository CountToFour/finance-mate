//USER

//EXPENSES

export type Expense = {
    id: string
    accountName: string
    category: string
    price: number
    description: string
    createdAt: string
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

// BUDGETS

// RECOMMENDATIONS

export type RecommendationAction = 'BUY' | 'SELL' | 'HOLD';

export type Recommendation = {
    symbol: string;
    friendlyName: string;
    rsiValue: number;
    action: RecommendationAction;
    latestClose: number;
    currency: string;
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
    recommendedReductionAmount?: number;
    recommendedReductionPercent?: number;
    scenario25Savings?: number;
    scenario25MonthsSaved?: number;
}

// CURRENCY

export type Currency = {
    code: string
    name: string
    symbol: string
}