package finance_mate.budget.model.dto;

import finance_mate.budget.model.PeriodContribution;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record FinancialGoalDto(
        @NotBlank(message = "Name cannot be empty")
        String name,
        @Positive(message = "Target amount is required and must be greater than 0")
        double targetAmount,
        @PositiveOrZero(message = "Initial amount cannot be less than 0")
        double initialAmount,
        @PositiveOrZero(message = "Contribution must cannot be less than 0")
        double contribution,
        boolean lockedFunds,
        @Nullable
        @Future(message = "Deadline must be in future")
        LocalDate deadline,
        String accountId,
        @Nullable
        PeriodContribution periodContribution
) {
}
