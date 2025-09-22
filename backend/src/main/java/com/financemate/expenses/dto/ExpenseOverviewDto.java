package com.financemate.expenses.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ExpenseOverviewDto {
    private double totalAmount;
    private double averageAmount;
    private int expenseCount;
    private double totalAmountChangePercentage;
    private int expenseCountChangePercentage;
}
