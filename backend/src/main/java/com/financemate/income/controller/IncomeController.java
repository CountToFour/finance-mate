package com.financemate.income.controller;

import com.financemate.income.dto.IncomeDto;
import com.financemate.income.model.Income;
import com.financemate.income.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<Income> addIncome(@Valid @RequestBody IncomeDto dto) {
        try {
            Income savedIncome = incomeService.addIncome(dto);
            return ResponseEntity.ok(savedIncome);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<IncomeDto>> getUserIncomes(@PathVariable String userId) {
        try {
            List<IncomeDto> incomes = incomeService.getUserIncomes(userId);
            return ResponseEntity.ok(incomes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recurring/{userId}")
    public ResponseEntity<List<IncomeDto>> getAllRecurringExpenses(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(incomeService.getAllRecurringIncomes(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{incomeId}")
    public ResponseEntity<Void> deleteIncome(@PathVariable String incomeId) {
        try {
            incomeService.deleteIncome(incomeId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/deactivate/{recurringIncomeId}")
    public ResponseEntity<Void> deactivateRecurringIncome(@PathVariable String recurringIncomeId) {
        try {
            incomeService.deactivateRecurringIncome(recurringIncomeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

}
