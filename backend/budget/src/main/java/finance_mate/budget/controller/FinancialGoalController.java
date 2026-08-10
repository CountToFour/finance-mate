package finance_mate.budget.controller;

import finance_mate.budget.model.dto.FinancialGoalDto;
import finance_mate.budget.model.dto.FinancialGoalResponseDto;
import finance_mate.budget.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class FinancialGoalController {

    private final GoalService financialGoalService;

    @PostMapping
    public ResponseEntity<FinancialGoalResponseDto> createGoal(@Valid @RequestBody FinancialGoalDto goalDto,
                                                               @RequestHeader("X-User-Id") String userId) {
        FinancialGoalResponseDto createdGoal = financialGoalService.createGoal(userId, goalDto);
        return ResponseEntity.ok(createdGoal);
    }

    @GetMapping
    public ResponseEntity<List<FinancialGoalResponseDto>> getGoalsForUser(@RequestHeader("X-User-Id") String userId) {
        List<FinancialGoalResponseDto> goals = financialGoalService.getGoalsForUser(userId);
        return ResponseEntity.ok(goals);
    }

    @PatchMapping("/{id}/deposit")
    public ResponseEntity<FinancialGoalResponseDto> depositToGoal(@PathVariable String id,
                                                                  @RequestParam double amount,
                                                                  @RequestParam String accountId,
                                                                  @RequestHeader("X-User-Id") String userId) {
        FinancialGoalResponseDto updatedGoal = financialGoalService.depositToGoal(id, amount, accountId, userId);
        return ResponseEntity.ok(updatedGoal);
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<FinancialGoalResponseDto> withdrawFromGoal(@PathVariable String id,
                                                                     @RequestParam double amount,
                                                                     @RequestParam String accountId,
                                                                     @RequestHeader("X-User-Id") String userId) {
        FinancialGoalResponseDto updatedGoal = financialGoalService.withdrawFromGoal(id, amount, accountId, userId);
        return ResponseEntity.ok(updatedGoal);
    }
}
