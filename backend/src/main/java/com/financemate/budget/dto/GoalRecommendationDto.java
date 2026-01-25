package com.financemate.budget.dto;

public record GoalRecommendationDto(
        String goalName,
        String categoryToCut,
        double monthlySavingsPotential,
        int monthsFaster,
        double recommendedReductionAmount,
        double recommendedReductionPercent,
        double scenario25Savings,
        int scenario25MonthsSaved,
        String message
) {}