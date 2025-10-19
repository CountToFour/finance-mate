package com.financemate.recommendation.dto;

import java.util.List;
import java.util.Map;

public record RecommendationRequest (
        Long userId,
        List<Map<String, Object>> transactions,
        List<Map<String, Object>> budgets,
        Map<String, Object> profile
) {}
