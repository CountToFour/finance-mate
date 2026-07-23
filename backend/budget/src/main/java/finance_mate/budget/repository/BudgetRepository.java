package finance_mate.budget.repository;

import finance_mate.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByUserId(String userId);

    Optional<Budget> findByCategoryIdAndActive(String categoryId, boolean active);

    List<Budget> findByUserIdAndActive(String userId, boolean active);
}
