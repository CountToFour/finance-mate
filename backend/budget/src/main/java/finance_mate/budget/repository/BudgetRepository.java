package finance_mate.budget.repository;

import com.financemate.auth.model.user.User;
import com.financemate.budget.model.Budget;
import com.financemate.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByUser(User user);

    Optional<Budget> findByCategoryAndActive(Category category, boolean active);

    List<Budget> findByUserAndActive(User user, boolean active);
}
