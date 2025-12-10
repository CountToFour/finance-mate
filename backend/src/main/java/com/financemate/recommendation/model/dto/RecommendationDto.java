package com.financemate.recommendation.model.dto;

import com.financemate.recommendation.model.RecommendationAction;

public record RecommendationDto(
        String symbol,
        String friendlyName,
        double rsiValue,
        RecommendationAction action,
        double latestClose,
        String currency
) {}
