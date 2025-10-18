package com.financemate.budget.service;

import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.dto.BudgetResponseDto;
import com.financemate.budget.mapper.BudgetMapper;
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
    private final BudgetMapper budgetMapper;

    @Override
    public BudgetResponseDto createBudget(User user, BudgetDto dto) {
        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Optional<Budget> existing = budgetRepository.findActiveByCategory(category);
        if (existing.isPresent()) {
            throw new IllegalStateException("Budżet dla tej kategorii już istnieje");
        }


        LocalDate start = dto.startDate() != null ? dto.startDate() : LocalDate.now();
        LocalDate end = start.plusMonths(1);

        Budget budget = budgetMapper.mapDtoToBudget(dto);
        budget.setUser(user);
        budget.setCategory(category);
        budget.setEndDate(end);

        budgetRepository.save(budget);
        BudgetResponseDto responseDto = budgetMapper.mapBudgetToResponseDto(budget);
        responseDto.setCategoryName(budget.getCategory().getName());
        return  responseDto;
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
    public List<BudgetResponseDto> getBudgetsForUser(User user) {
        return budgetRepository.findAllByUser(user).stream().map(budgetMapper::mapBudgetToResponseDto).toList();
    }

    @Override
    public BudgetResponseDto getBudgetById(String id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        return budgetMapper.mapBudgetToResponseDto(budget);
    }

    @Transactional
    @Override
    public BudgetResponseDto updateBudget(String id, BudgetDto dto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));

        if (dto.categoryId() != null) {
            String currentCategoryId = budget.getCategory() != null ? budget.getCategory().getId() : null;
            if (!dto.categoryId().equals(currentCategoryId)) {
                Category newCategory = categoryRepository.findById(dto.categoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                budget.setCategory(newCategory);
            }
        }

        if (Double.compare(dto.limitAmount(), budget.getLimitAmount()) != 0) {
            budget.setLimitAmount(dto.limitAmount());
        }

        budgetRepository.save(budget);
        BudgetResponseDto responseDto = budgetMapper.mapBudgetToResponseDto(budget);
        responseDto.setCategoryName(budget.getCategory().getName());
        return responseDto;
    }

    @Transactional
    @Override
    public void deleteBudget(String id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }
}

