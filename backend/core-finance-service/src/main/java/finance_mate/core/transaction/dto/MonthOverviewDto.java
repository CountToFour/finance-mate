package finance_mate.core.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MonthOverviewDto {
    public String month;
    public double totalIncome;
    public double totalExpense;
}
