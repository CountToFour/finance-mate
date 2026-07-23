package finance_mate.budget.repository;

import finance_mate.budget.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, String> {
    List<FinancialGoal> findByUserId(String userId);
}
