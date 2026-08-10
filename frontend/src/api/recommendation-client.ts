import type {InvestmentRecommendation} from "../types/recommendation.ts";
import api from "./api.ts";

export const recommendationService = {
    getSmartInvestmentRecommendation: async(): Promise<InvestmentRecommendation> => {
        const response = await api.get<InvestmentRecommendation>(
            `/recommendation/investment`
        )
        return response.data
    }
}