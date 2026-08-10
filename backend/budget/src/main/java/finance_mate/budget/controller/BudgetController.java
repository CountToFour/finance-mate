package finance_mate.budget.controller;

import finance_mate.budget.model.dto.BudgetDto;
import finance_mate.budget.model.dto.BudgetResponseDto;
import finance_mate.budget.model.dto.UpdateBudgetDto;
import finance_mate.budget.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponseDto> createBudget(@Valid @RequestBody BudgetDto budgetDto,
                                                          @RequestHeader("X-User-Id") String userId) {
        BudgetResponseDto createdBudget = budgetService.createBudget(userId, budgetDto);
        return ResponseEntity.ok(createdBudget);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponseDto>> getBudgetsForUser(@RequestHeader("X-User-Id") String userId) {
        List<BudgetResponseDto> budgets = budgetService.getBudgetsForUser(userId);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponseDto> getBudgetById(@PathVariable String id) {
        BudgetResponseDto budget = budgetService.getBudgetById(id);
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponseDto> updateBudget(@PathVariable String id,
                                                          @Valid @RequestBody UpdateBudgetDto budgetDto) {
        BudgetResponseDto updatedBudget = budgetService.updateBudget(id, budgetDto);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
