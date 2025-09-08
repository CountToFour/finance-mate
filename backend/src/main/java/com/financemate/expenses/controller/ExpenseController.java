package com.financemate.expenses.controller;

import com.financemate.expenses.dto.ExpenseDto;
import com.financemate.expenses.model.Expense;
import com.financemate.expenses.model.PeriodType;
import com.financemate.expenses.model.RecurringExpense;
import com.financemate.expenses.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<Expense> addExpense(@Valid @RequestBody ExpenseDto expense) {
        try {
            Expense saved = expenseService.addExpense(expense);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ExpenseDto>> getExpensesByUser(
            @PathVariable String userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        try {
            return ResponseEntity.ok(expenseService.getExpensesByUser(userId, category, minPrice, maxPrice, startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recurring/{userId}")
    public ResponseEntity<List<ExpenseDto>> getAllRecurringExpenses(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(expenseService.getAllRecurringExpenses(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/deactivate/{id}")
    public ResponseEntity<Void> deactivateRecurringExpense(@PathVariable String id) {
        try {
            expenseService.deactivateRecurringExpense(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editExpense(@PathVariable String id, @Valid @RequestBody ExpenseDto expenseDto) {
        try {
            if (expenseDto.getPeriodType() != PeriodType.NONE) {
                RecurringExpense updatedRecurring = expenseService.editRecurringExpense(id, expenseDto);
                return ResponseEntity.ok(updatedRecurring);
            } else {
                Expense updatedExpense = expenseService.editExpense(id, expenseDto);
                return ResponseEntity.ok(updatedExpense);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
