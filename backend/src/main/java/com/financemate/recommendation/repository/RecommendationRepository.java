package com.financemate.recommendation.repository;

import com.financemate.recommendation.model.RsiRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<RsiRecommendation, String> {
    boolean existsBySymbol(String symbol);

    Optional<RsiRecommendation> findBySymbol(String symbol);
}
