package com.financemate.budget.dto;

import com.financemate.budget.model.BudgetPeriodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record BudgetDto (
        @NotBlank(message = "Category cannot be empty") String categoryId,
        @Positive(message = "Limit amount is demand") double limitAmount,
        BudgetPeriodType periodType,
        LocalDate startDate,
        LocalDate endDate
) {}
