package com.financemate.budget.controller;

import com.financemate.budget.service.BudgetService;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetRepository budgetRepository;

    @PostMapping
    public BudgetDto createMonthlyBudget(@RequestParam String userId,
                                         @RequestParam String categoryId,
                                         @RequestParam double amount,
                                         @RequestParam(required = false) String date) {
        var anchor = date != null ? LocalDate.parse(date) : LocalDate.now();
        return budgetService.createMonthlyBudget(userId, categoryId, amount, anchor);
    }

}

