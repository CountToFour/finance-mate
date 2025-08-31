package com.financemate.income.repository;

import com.financemate.income.model.RecurringIncome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringIncomeRepository extends JpaRepository<RecurringIncome, String> {
    List<RecurringIncome> findAllByActive(boolean active);
    List<RecurringIncome> findAllByUserId(String userId);
}
