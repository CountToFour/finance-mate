package finance_mate.core.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BudgetProgressDto {
    private String categoryId;
    private double amount;
}
