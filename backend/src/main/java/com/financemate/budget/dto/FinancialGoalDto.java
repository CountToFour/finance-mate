package com.financemate.budget.dto;

import java.time.LocalDate;

public record FinancialGoalDto(
        String name,
        double targetAmount,
        double initialAmount,
        boolean lockedFunds,
        LocalDate deadline
) {
}
