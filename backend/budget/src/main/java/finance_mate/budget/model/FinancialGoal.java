package finance_mate.budget.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "financial_goals")
public class FinancialGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private double targetAmount;
    private double currentAmount = 0;
    private double contribution;
    private boolean completed = false;
    private LocalDate deadline;
    private boolean lockedFunds;
    private String userId;
    @Enumerated(EnumType.STRING)
    private PeriodContribution periodContribution;
    private LocalDate nextContribution;
    private String accountId;
}
