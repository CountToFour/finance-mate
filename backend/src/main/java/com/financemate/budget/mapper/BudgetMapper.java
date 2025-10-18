package com.financemate.budget.mapper;

import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.dto.BudgetResponseDto;
import com.financemate.budget.dto.FinancialGoalDto;
import com.financemate.budget.dto.FinancialGoalResponseDto;
import com.financemate.budget.model.Budget;
import com.financemate.budget.model.FinancialGoal;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BudgetMapper {
    Budget mapDtoToBudget(BudgetDto budget);
    BudgetResponseDto mapBudgetToResponseDto(Budget budget);
    FinancialGoalResponseDto mapGoalToDto(FinancialGoal financialGoal);
    FinancialGoal mapDtoToGoal(FinancialGoalDto dto);
}
