package com.financemate.budget.controller;

import com.financemate.auth.model.user.User;
import com.financemate.auth.service.UserService;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.dto.BudgetResponseDto;
import com.financemate.budget.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<BudgetResponseDto> createBudget(@RequestBody BudgetDto budgetDto,
                                                          Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        BudgetResponseDto createdBudget = budgetService.createBudget(user, budgetDto);
        return ResponseEntity.ok(createdBudget);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponseDto>> getBudgetsForUser(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        List<BudgetResponseDto> budgets = budgetService.getBudgetsForUser(user);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponseDto> getBudgetById(@PathVariable String id) {
        BudgetResponseDto budget = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponseDto> updateBudget(@PathVariable String id,
                                                          @RequestBody BudgetDto budgetDto) {
        BudgetResponseDto updatedBudget = budgetService.updateBudget(id, budgetDto);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
