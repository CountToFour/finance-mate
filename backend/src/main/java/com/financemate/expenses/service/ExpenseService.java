package com.financemate.expenses.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.mapper.ExpenseMapper;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<ExpenseDto> getExpensesByUser(String userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(expenseMapper::toDto)
                .collect(Collectors.toList());
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
