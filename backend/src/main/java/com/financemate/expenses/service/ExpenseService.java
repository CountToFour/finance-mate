package com.financemate.expenses.service;

import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.mapper.ExpenseMapper;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;

    public Expense addExpense(ExpenseDto expense) {
        Expense expense1 = expenseMapper.toEntity(expense);
        return expenseRepository.save(expense1);
    }

    public List<ExpenseDto> getExpensesByUser(String userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(expense ->  expenseMapper.toDto(expense))
                .collect(Collectors.toList());
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
