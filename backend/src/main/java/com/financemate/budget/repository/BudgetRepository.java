package com.financemate.budget.repository;

import com.financemate.budget.model.Budget;
import com.financemate.budget.model.BudgetPeriodType;
import com.financemate.budget.model.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
//    Optional<Budget> findFirstByUserIdAndCategoryIdAndPeriodTypeAndStatusAndPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(
//            String userId, String categoryId, BudgetPeriodType periodType, BudgetStatus status, LocalDate date1, LocalDate date2
//    );
//    List<Budget> findAllByUserIdAndStatusAndPeriodEndBefore(String userId, BudgetStatus status, LocalDate beforeDate);
//    List<Budget> findAllByUserIdAndCategoryIdOrderByPeriodStartDesc(String userId, String categoryId);

}
