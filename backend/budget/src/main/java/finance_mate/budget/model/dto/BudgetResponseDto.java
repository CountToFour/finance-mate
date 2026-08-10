package finance_mate.budget.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BudgetResponseDto {
        private String id;
        private double limitAmount;
        private double spentAmount;
        private boolean active;
        private LocalDate startDate;
        private LocalDate endDate;
        private String categoryName;
}
