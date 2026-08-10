package finance_mate.budget.model.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record BudgetDto (
        @NotBlank(message = "Category cannot be empty")
        String categoryId,
        @Positive(message = "Limit amount must be a number greater than 0")
        double limitAmount,
        @FutureOrPresent(message = "Start date cannot be empty or in past")
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @FutureOrPresent(message = "End date cannot be empty or in the past")
        @NotNull(message = "End date is required")
        LocalDate endDate
) {}
