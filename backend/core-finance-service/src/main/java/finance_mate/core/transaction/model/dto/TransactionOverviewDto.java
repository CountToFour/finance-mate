package finance_mate.core.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TransactionOverviewDto {
    private double totalAmount;
    private double averageAmount;
    private int expenseCount;
    private double totalAmountChangePercentage;
    private int expenseCountChangePercentage;
}
