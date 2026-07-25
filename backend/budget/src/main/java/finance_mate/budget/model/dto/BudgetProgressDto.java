package finance_mate.budget.model.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class BudgetProgressDto {
    private String categoryId;
    private double amount;
    private LocalDate transactionDate;
}
