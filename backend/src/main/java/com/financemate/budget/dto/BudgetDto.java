package com.financemate.budget.dto;

import java.time.LocalDate;

public class BudgetDto {
    private String id;
    private String userId;
    private String categoryId;
    private String periodType;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private double amount;
    private double spent;
    private String status;
    private double remaining;

}
