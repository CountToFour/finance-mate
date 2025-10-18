package com.financemate.budget.controller;

import com.financemate.auth.model.user.User;
import com.financemate.auth.service.UserService;
import com.financemate.budget.dto.FinancialGoalDto;
import com.financemate.budget.dto.FinancialGoalResponseDto;
import com.financemate.budget.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class FinancialGoalController {

    private final GoalService financialGoalService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<FinancialGoalResponseDto> createGoal(@Valid @RequestBody FinancialGoalDto goalDto,
                                                               Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        FinancialGoalResponseDto createdGoal = financialGoalService.createGoal(user, goalDto);
        return ResponseEntity.ok(createdGoal);
    }

    @GetMapping
    public ResponseEntity<List<FinancialGoalResponseDto>> getGoalsForUser(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        List<FinancialGoalResponseDto> goals = financialGoalService.getGoalsForUser(user);
        return ResponseEntity.ok(goals);
    }

    @PatchMapping("/{id}/deposit")
    public ResponseEntity<FinancialGoalResponseDto> depositToGoal(@PathVariable String id,
                                                                  @RequestParam double amount,
                                                                  @RequestParam String accountId,
                                                                  Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        FinancialGoalResponseDto updatedGoal = financialGoalService.depositToGoal(id, amount, accountId, user);
        return ResponseEntity.ok(updatedGoal);
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<FinancialGoalResponseDto> withdrawFromGoal(@PathVariable String id,
                                                                     @RequestParam double amount,
                                                                     @RequestParam String accountId,
                                                                     Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        FinancialGoalResponseDto updatedGoal = financialGoalService.withdrawFromGoal(id, amount, accountId, user);
        return ResponseEntity.ok(updatedGoal);
    }
}
