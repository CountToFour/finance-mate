package com.financemate.budget.service;

import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.model.Budget;
import com.financemate.budget.model.BudgetPeriodType;
import com.financemate.budget.repository.BudgetRepository;
import com.financemate.category.model.Category;
import com.financemate.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StandardBudgetService implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Budget createBudget(User user, BudgetDto dto) {
        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Optional<Budget> existing = budgetRepository.findActiveByCategory(category);
        if (existing.isPresent()) {
            throw new IllegalStateException("Budżet dla tej kategorii już istnieje");
        }


        LocalDate start = dto.startDate() != null ? dto.startDate() : LocalDate.now();
        LocalDate end = start.plusMonths(1);

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setLimitAmount(dto.limitAmount());
        budget.setPeriodType(dto.periodType() != null ? dto.periodType() : BudgetPeriodType.MONTHLY);
        budget.setStartDate(start);
        budget.setEndDate(end);

        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public void updateSpentAmount(Category category, double amount) {
        Budget budget = budgetRepository.findActiveByCategory(category).orElseThrow(
                () -> new RuntimeException("Active budget not found for category")
        );
        budget.setSpentAmount(budget.getSpentAmount() + amount);
    }

    @Override
    public List<Budget> getBudgetsForUser(User user) {
        return budgetRepository.findAllByUser(user);
    }
}

