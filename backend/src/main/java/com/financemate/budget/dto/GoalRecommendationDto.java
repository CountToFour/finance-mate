package com.financemate.budget.dto;

public record GoalRecommendationDto(
        String goalName,
        String categoryToCut,
        double monthlySavingsPotential,
        int monthsFaster,
        String message
) {}