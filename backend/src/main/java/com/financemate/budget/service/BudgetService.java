package com.financemate.budget.service;

import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.model.Budget;
import com.financemate.category.model.Category;

import java.util.List;

public interface BudgetService {
    Budget createBudget(User user, BudgetDto dto);
    void updateSpentAmount(Category category, double amount);
    List<Budget> getBudgetsForUser(User user);
}
