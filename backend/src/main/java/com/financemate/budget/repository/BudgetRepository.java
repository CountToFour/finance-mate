package com.financemate.budget.repository;

import com.financemate.auth.model.user.User;
import com.financemate.budget.model.Budget;
import com.financemate.budget.model.BudgetPeriodType;
import com.financemate.budget.model.BudgetStatus;
import com.financemate.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findAllByUser(User user);
    Optional<Budget> findActiveByCategory(Category category);
}
