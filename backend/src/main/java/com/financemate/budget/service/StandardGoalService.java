package com.financemate.budget.service;

import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.FinancialGoalDto;
import com.financemate.budget.dto.FinancialGoalResponseDto;
import com.financemate.budget.mapper.BudgetMapper;
import com.financemate.budget.model.FinancialGoal;
import com.financemate.budget.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardGoalService implements GoalService {

    private final FinancialGoalRepository goalRepository;
    private final BudgetMapper budgetMapper;

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

}
