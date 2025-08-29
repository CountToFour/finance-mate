package com.financemate.expenses.repository;

import com.financemate.expenses.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, String>, JpaSpecificationExecutor<Expense> {
    List<Expense> findByUserId(String userId);
    Optional<Expense> findById(String id);
}
