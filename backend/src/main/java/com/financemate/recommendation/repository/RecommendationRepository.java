package com.financemate.recommendation.repository;

import com.financemate.recommendation.model.RecommendationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<RecommendationEntity, Long> {
    List<RecommendationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
