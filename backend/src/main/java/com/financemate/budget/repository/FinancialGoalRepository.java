package com.financemate.budget.repository;

import com.financemate.auth.model.user.User;
import com.financemate.budget.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, String> {
    List<FinancialGoal> findByUser(User user);
}
