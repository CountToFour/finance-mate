package com.financemate.budget.service;

import com.financemate.account.service.AccountService;
import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.FinancialGoalDto;
import com.financemate.budget.dto.FinancialGoalResponseDto;
import com.financemate.budget.mapper.BudgetMapper;
import com.financemate.budget.model.FinancialGoal;
import com.financemate.budget.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardGoalService implements GoalService {

    private final FinancialGoalRepository goalRepository;
    private final BudgetMapper budgetMapper;
    private final AccountService accountService;

    @Override
    public FinancialGoalResponseDto createGoal(User user, FinancialGoalDto dto) {
        FinancialGoal goal = budgetMapper.mapDtoToGoal(dto);
        goal.setUser(user);

        FinancialGoal saved = goalRepository.save(goal);
        return budgetMapper.mapGoalToDto(saved);
    }

    @Override
    public List<FinancialGoalResponseDto> getGoalsForUser(User user) {
        return goalRepository.findByUser(user)
                .stream()
                .map(budgetMapper::mapGoalToDto)
                .toList();
    }

    @Transactional
    @Override
    public FinancialGoalResponseDto depositToGoal(String goalId, double amount, String accountId, User user) {
        FinancialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        try {
            accountService.changeBalance(accountId, -amount, user.getId());
            goal.setCurrentAmount(goal.getCurrentAmount() + amount);

            if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
                goal.setCompleted(true);
            }

            goalRepository.save(goal);
            return budgetMapper.mapGoalToDto(goal);
        } catch (Exception e) {
            throw new RuntimeException("Failed to change account balance: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public FinancialGoalResponseDto withdrawFromGoal(String goalId, double amount, String accountId, User user) {
        FinancialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (goal.isCompleted()) {
            throw new RuntimeException("Funds in this goal are locked");
        }

        if (goal.getCurrentAmount() - amount < 0) {
            throw new RuntimeException("Not enough saved funds in the goal");
        }

        try {
            accountService.changeBalance(accountId, -amount, user.getId());
            goal.setCurrentAmount(goal.getCurrentAmount() - amount);

            goalRepository.save(goal);
            return budgetMapper.mapGoalToDto(goal);
        } catch (Exception e) {
            throw new RuntimeException("Failed to change account balance: " + e.getMessage());
        }

    }
}
