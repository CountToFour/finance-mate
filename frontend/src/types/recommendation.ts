export interface Recommendation {
    symbol: string;
    friendlyName: string;
    rsiValue: number;
    action: RecommendationAction;
    latestClose: number;
}

export type RecommendationAction = 'BUY' | 'HOLD' | 'SELL'
export type InvestmentProfile = 'CRITICAL' | 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'

export interface InvestmentRecommendation {
    recommendations: Recommendation[];
    profile: InvestmentProfile;
    savingsRate: number;
    message: string;
}