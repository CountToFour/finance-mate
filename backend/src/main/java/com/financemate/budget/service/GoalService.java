package com.financemate.budget.service;

import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.FinancialGoalDto;
import com.financemate.budget.dto.FinancialGoalResponseDto;

import java.util.List;

public interface GoalService {
    FinancialGoalResponseDto createGoal(User user, FinancialGoalDto dto);
    List<FinancialGoalResponseDto> getGoalsForUser(User user);
    FinancialGoalResponseDto depositToGoal(String goalId, double amount, String accountId, User user);
    FinancialGoalResponseDto withdrawFromGoal(String goalId, double amount, String accountId, User user);
}
