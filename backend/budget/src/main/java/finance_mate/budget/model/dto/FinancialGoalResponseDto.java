package finance_mate.budget.model.dto;

import finance_mate.budget.model.PeriodContribution;

import java.time.LocalDate;

public record FinancialGoalResponseDto (
        String id,
        String name,
        double targetAmount,
        double currentAmount,
        double contribution,
        boolean completed,
        boolean lockedFunds,
        LocalDate deadline,
        PeriodContribution periodContribution,
        LocalDate nextContribution,
        String accountId
) {
}
