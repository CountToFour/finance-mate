package com.financemate.expenses.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.expenses.dto.CategoryDto;
import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.mapper.ExpenseMapper;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.model.PeriodType;
import com.financemate.expenses.model.RecurringExpense;
import com.financemate.expenses.repository.ExpenseRepository;
import com.financemate.expenses.repository.RecurringExpenseRepository;
import com.financemate.expenses.utils.ExpenseSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseMapper expenseMapper;
    private final UserRepository userRepository;

    public Expense addExpense(ExpenseDto expense) {
        Expense expense1 = expenseMapper.expenseToEntity(expense);
        userRepository.findById(expense.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + expense.getUserId()));
        if (expense1.getExpenseDate() == null) {
            expense1.setExpenseDate(LocalDate.now());
        }

        return expenseRepository.save(expense1);
    }

    public void addRecurringExpense(ExpenseDto expenseDto) {
        if (expenseDto.getPeriodType() != PeriodType.NONE) {
            RecurringExpense recurringExpense = expenseMapper.recurringExpenseToEntity(expenseDto);
            recurringExpense.setActive(true);

            if (recurringExpense.getExpenseDate() != null && !recurringExpense.getExpenseDate().isAfter(LocalDate.now())) {
                addExpense(expenseDto);
                recurringExpense.setExpenseDate(calculateNextDate(recurringExpense.getExpenseDate(), recurringExpense.getPeriodType()));
            }
            recurringExpenseRepository.save(recurringExpense);
        } else {
            throw new IllegalArgumentException("Period type must be specified for recurring expenses.");
        }
    }

    public List<ExpenseDto> getExpensesByUser(String userId, String category, BigDecimal minPrice, BigDecimal maxPrice,
                                              LocalDate startDate, LocalDate endDate) {
        checkUserExists(userId);

        Specification<Expense> spec = Specification.allOf(ExpenseSpecifications.hasUserId(userId))
                .and(ExpenseSpecifications.hasCategory(category))
                .and(ExpenseSpecifications.amountBetween(minPrice, maxPrice))
                .and(ExpenseSpecifications.dateBetween(startDate, endDate));

        return expenseRepository.findAll(spec).stream()
                .map(expenseMapper::expenseToDto)
                .toList();
    }

    public List<ExpenseDto> getAllRecurringExpenses(String userId) {
        checkUserExists(userId);

        return recurringExpenseRepository.findAllByUserId(userId).stream()
                .map(expenseMapper::recurringExpenseToDto)
                .toList();
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }

    public void deleteRecurringExpense(String id) {
        if (!recurringExpenseRepository.existsById(id)) {
            throw new IllegalArgumentException("Recurring expense not found with id: " + id);
        }
        recurringExpenseRepository.deleteById(id);
    }

    public void deactivateRecurringExpense(String id) {
        RecurringExpense recurringExpense = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring expense not found with id: " + id));
        recurringExpense.setActive(!recurringExpense.isActive());
        recurringExpenseRepository.save(recurringExpense);
    }

    public Expense editExpense(String id, ExpenseDto expenseDto) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));

        if (expenseDto.getCategory() != null) {
            existingExpense.setCategory(expenseDto.getCategory());
        }
        if (expenseDto.getPrice() != null) {
            existingExpense.setPrice(expenseDto.getPrice());
        }
        if (expenseDto.getDescription() != null) {
            existingExpense.setDescription(expenseDto.getDescription());
        }
        if (expenseDto.getExpenseDate() != null) {
            existingExpense.setExpenseDate(expenseDto.getExpenseDate());
        }

        return expenseRepository.save(existingExpense);
    }

    public RecurringExpense editRecurringExpense(String id, ExpenseDto expenseDto) {
        RecurringExpense existingRecurringExpense = recurringExpenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring expense not found with id: " + id));

        if (expenseDto.getCategory() != null) {
            existingRecurringExpense.setCategory(expenseDto.getCategory());
        }
        if (expenseDto.getPrice() != null) {
            existingRecurringExpense.setPrice(expenseDto.getPrice());
        }
        if (expenseDto.getDescription() != null) {
            existingRecurringExpense.setDescription(expenseDto.getDescription());
        }
        if (expenseDto.getExpenseDate() != null) {
            existingRecurringExpense.setExpenseDate(expenseDto.getExpenseDate());
        }
        if (expenseDto.getPeriodType() != null && expenseDto.getPeriodType() != PeriodType.NONE) {
            existingRecurringExpense.setPeriodType(expenseDto.getPeriodType());
        }
        if (expenseDto.isActive() != existingRecurringExpense.isActive()) {
            existingRecurringExpense.setActive(expenseDto.isActive());
        }

        return recurringExpenseRepository.save(existingRecurringExpense);
    }

    public List<CategoryDto> getAllCategoriesAmount(String userId, LocalDate startDate, LocalDate endDate) {
        checkUserExists(userId);

        Specification<Expense> spec = Specification.allOf(ExpenseSpecifications.hasUserId(userId))
                .and(ExpenseSpecifications.dateBetween(startDate, endDate));

        Set<String> categories = expenseRepository.findAll(spec).stream()
                .map(Expense::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return categories.stream()
                .map(category -> {
                    BigDecimal totalAmount = expenseRepository.findAll(spec.and(ExpenseSpecifications.hasCategory(category))).stream()
                            .map(Expense::getPrice)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new CategoryDto(category, totalAmount);
                })
                .toList();
    }

    private LocalDate calculateNextDate(LocalDate baseDate, PeriodType type) {
        return switch (type) {
            case DAILY -> baseDate.plusDays(1);
            case WEEKLY -> baseDate.plusWeeks(1);
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY -> baseDate.plusYears(1);
            default -> baseDate;
        };
    }

    private void checkUserExists(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
    }
}
