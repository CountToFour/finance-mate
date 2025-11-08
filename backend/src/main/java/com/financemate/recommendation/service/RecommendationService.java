package com.financemate.recommendation.service;


import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;

public interface RecommendationService {
    TwelveDataTimeSeriesResponse getRecommendation();
}
