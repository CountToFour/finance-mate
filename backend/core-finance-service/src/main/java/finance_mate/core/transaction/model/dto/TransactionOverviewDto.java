package finance_mate.core.transaction.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TransactionOverviewDto {
    private Double totalValue;
    private int totalAmount;
    private double totalValuePercentageChange;
    private double totalAmountPercentageChange;
    private double dailyAverage;
}