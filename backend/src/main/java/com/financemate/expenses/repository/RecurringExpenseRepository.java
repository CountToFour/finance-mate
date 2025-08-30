package com.financemate.expenses.repository;

import com.financemate.expenses.model.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, String> {
    List<RecurringExpense> findAllByActive(boolean active);
}
