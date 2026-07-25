package finance_mate.core.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class BudgetProgressDto {
    private String categoryId;
    private double amount;
    private LocalDate transactionDate;
}
