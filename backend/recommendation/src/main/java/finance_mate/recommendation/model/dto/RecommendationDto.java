package finance_mate.recommendation.model.dto;

import finance_mate.recommendation.model.RecommendationAction;

public record RecommendationDto(
        String symbol,
        String friendlyName,
        double rsiValue,
        RecommendationAction action,
        double latestClose
//        String currency
) {}
