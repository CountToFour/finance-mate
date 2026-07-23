package finance_mate.budget.model.dto;

import finance_mate.budget.model.BudgetPeriodType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record BudgetDto (
        @NotBlank(message = "Category cannot be empty")
        String categoryId,
        @Positive(message = "Limit amount must be a number greater than 0")
        double limitAmount,
        @Nullable
        BudgetPeriodType periodType,
        @Nullable
        @FutureOrPresent(message = "Start date cannot be in past")
        LocalDate startDate,
        @Nullable
        @FutureOrPresent(message = "End date cannot be in the past")
        LocalDate endDate
) {}
