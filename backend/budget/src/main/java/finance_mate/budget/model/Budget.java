package finance_mate.budget.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId;

    private String categoryId;
    private String categoryName;

    @Enumerated(EnumType.STRING)
    private BudgetPeriodType periodType = BudgetPeriodType.MONTHLY;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active = true;
    private double limitAmount;
    private double spentAmount;
}