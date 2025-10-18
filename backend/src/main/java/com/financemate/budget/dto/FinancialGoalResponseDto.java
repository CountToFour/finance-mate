package com.financemate.budget.dto;

import java.time.LocalDate;

public record FinancialGoalResponseDto (
        String id,
        String name,
        double targetAmount,
        double savedAmount,
        boolean completed,
        boolean lockedFunds,
        LocalDate deadline
) {
}
