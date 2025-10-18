package com.financemate.budget.dto;

import com.financemate.budget.model.BudgetPeriodType;

import java.time.LocalDate;

public record BudgetDto (
        String categoryId,
        double limitAmount,
        BudgetPeriodType periodType,
        LocalDate startDate,
        LocalDate endDate
) {}
