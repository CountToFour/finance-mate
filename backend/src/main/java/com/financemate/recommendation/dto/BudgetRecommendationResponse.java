package com.financemate.recommendation.dto;

import java.util.List;
import java.util.Map;

public record BudgetRecommendationResponse(
        List<Map<String, Double>> budgetAllocations,
        List<String> recommendations
) {
}
