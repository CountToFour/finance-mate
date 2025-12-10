package com.financemate.recommendation.controller;

import com.financemate.auth.model.user.User;
import com.financemate.auth.service.UserService;
import com.financemate.budget.dto.GoalRecommendationDto;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.SpendingStructureDto;
import com.financemate.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendation")
@CrossOrigin("*")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getRecommendation() {
        try {
            List<RsiRecommendation> recommendation = recommendationService.getRecommendation();
            return ResponseEntity.ok().body(recommendation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching recommendation: " + e.getMessage());
        }
    }

    @GetMapping("/smart")
    public ResponseEntity<?> getSmartRecommendation(Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(recommendationService.getSmartRecommendation(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching smart recommendation: " + e.getMessage());
        }
    }

    @GetMapping("/auditor")
    public ResponseEntity<SpendingStructureDto> getSpendingAuditor(Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(recommendationService.getSpendingAuditor(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/goal-accelerator")
    public ResponseEntity<?> getGoalAcceleratorRecommendation(Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            GoalRecommendationDto goalRecommendation = recommendationService.getGoalRecommendation(user);

            if (goalRecommendation == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(goalRecommendation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching goal recommendation: " + e.getMessage());
        }
    }

}
