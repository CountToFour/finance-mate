package finance_mate.budget.model.dto;

import finance_mate.budget.model.PeriodContribution;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record FinancialGoalDto(
        @NotBlank(message = "Name cannot be empty")
        String name,
        @Positive(message = "Target amount is required and must be greater than 0")
        double targetAmount,
        double initialAmount,
        double contribution,
        boolean lockedFunds,
        LocalDate deadline,
        String accountId,
        PeriodContribution periodContribution
) {
}
