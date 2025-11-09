package com.financemate.recommendation.service;


import com.financemate.recommendation.model.RsiRecommendation;

import java.util.List;

public interface RecommendationService {
    List<RsiRecommendation> getRecommendation();
}
