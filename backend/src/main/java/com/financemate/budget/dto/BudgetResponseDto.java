package com.financemate.budget.dto;

import com.financemate.budget.model.BudgetPeriodType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BudgetResponseDto {
        private String id;
        private double amount;
        private double spentAmount;
        private boolean active;
        private LocalDate startDate;
        private LocalDate endDate;
        private BudgetPeriodType periodType;
        private String categoryName;
}
