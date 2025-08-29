package com.financemate.expenses.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.mapper.ExpenseMapper;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.repository.ExpenseRepository;
import com.financemate.expenses.utils.ExpenseSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final UserRepository userRepository;

    public Expense addExpense(ExpenseDto expense) {
        Expense expense1 = expenseMapper.toEntity(expense);
        userRepository.findById(expense.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + expense.getUserId()));
        if (expense1.getExpenseDate() == null) {
            expense1.setExpenseDate(LocalDate.now());
        }

        return expenseRepository.save(expense1);
    }

    public List<ExpenseDto> getExpensesByUser(String userId, String category, BigDecimal minPrice, BigDecimal maxPrice,
                                              LocalDate startDate, LocalDate endDate) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Specification<Expense> spec = Specification.allOf(ExpenseSpecifications.hasUserId(userId))
                .and(ExpenseSpecifications.hasCategory(category))
                .and(ExpenseSpecifications.amountBetween(minPrice, maxPrice))
                .and(ExpenseSpecifications.dateBetween(startDate, endDate));

        return expenseRepository.findAll(spec).stream()
                .map(expenseMapper::toDto)
                .toList();
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
