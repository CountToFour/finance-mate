package finance_mate.core.transaction.model.dto;

import finance_mate.core.transaction.model.PeriodType;
import finance_mate.core.transaction.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class RecurringTransactionResponse {
    private String id;
    private String accountName;
    private String categoryName;
    private double price;
    private String description;
    private LocalDate createdAt;
    private TransactionType transactionType;
    private PeriodType periodType;
    private boolean active;
}
