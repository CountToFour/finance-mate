package finance_mate.budget.service;

import finance_mate.budget.model.dto.BudgetDto;
import finance_mate.budget.model.dto.BudgetResponseDto;
import finance_mate.budget.model.dto.UpdateBudgetDto;

import java.util.List;

public interface BudgetService {
    BudgetResponseDto createBudget(String userId, BudgetDto dto);
//    void updateSpentAmount(Category category, double amount, String accountCurrency, String userCurrency);
    List<BudgetResponseDto> getBudgetsForUser(String userId);
    BudgetResponseDto getBudgetById(String id);
    BudgetResponseDto updateBudget(String id, UpdateBudgetDto dto);
    void deleteBudget(String id);
}
