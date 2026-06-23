package finance_mate.recommendation.model.dto;

public record SpendingStructureDto(
        double needsPercent,
        double wantsPercent,
        double savingsPercent,
        double totalIncome,
        String recommendation
) {}
