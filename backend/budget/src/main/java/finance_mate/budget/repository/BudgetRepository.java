package finance_mate.budget.repository;

import finance_mate.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByUserId(String userId);

    Optional<Budget> findByCategoryIdAndActive(String categoryId, boolean active);

    @Query("""
            SELECT b FROM Budget b
            WHERE b.categoryId = :categoryId
              AND b.endDate > :startDate
              AND b.active = TRUE
            """)
    Optional<Budget> findByCategoryIdAndEndDate(@Param("categoryId") String categoryId, @Param("startDate") LocalDate startDate);
    List<Budget> findByUserIdAndActive(String userId, boolean active);
}
