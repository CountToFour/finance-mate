package finance_mate.budget.repository;

import finance_mate.budget.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, String> {
    List<FinancialGoal> findByUserId(String userId);

    @Query("""
            SELECT fg
            FROM FinancialGoal fg
            WHERE fg.nextContribution < :nextContribution
              AND fg.completed = false
            """)
    List<FinancialGoal> findAllByDateAndActive(
            @Param("nextContribution") LocalDate nextContribution);
}
