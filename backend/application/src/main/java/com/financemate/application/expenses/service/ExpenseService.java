package com.financemate.application.expenses.service;

import com.financemate.application.expenses.model.Expense;
import com.financemate.application.expenses.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Expense addExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByUser(String userId) {
        return expenseRepository.findByUserId(userId);
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
