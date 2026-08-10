package finance_mate.recommendation.controller;

import finance_mate.recommendation.model.RsiRecommendation;
import finance_mate.recommendation.model.dto.GoalRecommendationDto;
import finance_mate.recommendation.model.dto.InvestmentRecommendationDto;
import finance_mate.recommendation.model.dto.SpendingStructureDto;
import finance_mate.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendation")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/investment/all")
    public ResponseEntity<List<RsiRecommendation>> getRecommendation() {
        List<RsiRecommendation> recommendation = recommendationService.getRecommendation();
        return ResponseEntity.ok().body(recommendation);
    }

    @GetMapping("/investment")
    public ResponseEntity<InvestmentRecommendationDto> getSmartInvestmentRecommendation(@RequestHeader("X-User-Id") String userId) {
        InvestmentRecommendationDto smartInvestmentRecommendation = recommendationService.getSmartInvestmentRecommendation(userId);
        return ResponseEntity.ok().body(smartInvestmentRecommendation);
    }

//    @GetMapping("/smart")
//    public ResponseEntity<?> getSmartRecommendation(@RequestHeader("X-User-Id") String userId) {
//        try {
//            return ResponseEntity.ok(recommendationService.getSmartRecommendation(userId));
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error fetching smart recommendation: " + e.getMessage());
//        }
//    }

//    @GetMapping("/auditor")
//    public ResponseEntity<SpendingStructureDto> getSpendingAuditor(@RequestHeader("X-User-Id") String userId) {
//        try {
//            SpendingStructureDto spendingAuditor = recommendationService.getSpendingAuditor(userId);
//            return ResponseEntity.ok(spendingAuditor);
//        } catch (Exception e) {
//            return ResponseEntity.status(500).build();
//        }
//    }

//    @GetMapping("/goal-accelerator")
//    public ResponseEntity<?> getGoalAcceleratorRecommendation(@RequestHeader("X-User-Id") String userId) {
//        try {
//            GoalRecommendationDto goalRecommendation = recommendationService.getGoalRecommendation(userId);
//
//            if (goalRecommendation == null) {
//                return ResponseEntity.noContent().build();
//            }
//
//            return ResponseEntity.ok(goalRecommendation);
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error fetching goal recommendation: " + e.getMessage());
//        }
//    }

}
