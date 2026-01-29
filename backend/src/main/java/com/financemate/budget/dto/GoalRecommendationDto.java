package com.financemate.budget.dto;

public record GoalRecommendationDto(
        String goalName,                    // Nazwa celu finansowego
        String categoryToCut,               // Kategoria do optymalizacji
        double monthlySavingsPotential,     // Potencjalna kwota oszczędności
        int monthsFaster,                   // O ile miesięcy szybciej osiągniemy cel
        double recommendedReductionAmount,  // Sugerowana redukcja wydatków
        double recommendedReductionPercent, // Sugerowany % redukcji wydatków
        double scenario25Savings,           // Oszczędności w scenariuszu 25%
        int scenario25MonthsSaved,          // Miesiące zaoszczędzone w scenariuszu 25%
        String message                      //Spersonalizowany komunikat
) {
}