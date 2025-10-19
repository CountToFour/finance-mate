package com.financemate.recommendation.dto;

import java.util.List;
import java.util.Map;

public record RecommendationResponse(
        List<String> savingTips,
        List<Map<String, Object>> anomalies,
        List<Map<String, Object>> budgetSuggestions,
        String modelVersion) {
}
