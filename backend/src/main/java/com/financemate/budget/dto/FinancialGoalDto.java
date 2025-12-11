package com.financemate.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record FinancialGoalDto(
        @NotBlank(message = "Name cannot be empty") String name,
        @Positive(message = "Taget amount is demand") double targetAmount,
        double initialAmount,
        double monthlyContribution,
        boolean lockedFunds,
        LocalDate deadline,
        String accountId
) {
}
