package finance_mate.core.transaction.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.hibernate.annotations.SecondaryRow;

@Getter
@SecondaryRow
@AllArgsConstructor
public class CategoryDto {
    String category;
    double amount;
    int transactions;
    double percentage;
}
