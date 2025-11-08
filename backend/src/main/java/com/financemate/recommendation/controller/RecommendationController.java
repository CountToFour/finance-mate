package com.financemate.recommendation.controller;

import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendation")
@CrossOrigin("*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<?> getRecommendation() {
        TwelveDataTimeSeriesResponse recommendation = recommendationService.getRecommendation();
        return ResponseEntity.ok().body(recommendation);
    }
}
