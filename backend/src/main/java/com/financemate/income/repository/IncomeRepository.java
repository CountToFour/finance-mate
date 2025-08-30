package com.financemate.income.repository;

import com.financemate.income.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, String> {
    List<Income> findByUserId(String userId);
    List<Income> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
}
