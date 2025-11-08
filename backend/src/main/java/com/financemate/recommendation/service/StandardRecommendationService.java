package com.financemate.recommendation.service;

import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardRecommendationService implements RecommendationService {

    private final TwelveDataClient twelveDataClient;

    @Override
    public TwelveDataTimeSeriesResponse getRecommendation() {
        return twelveDataClient.getTimeSeries("AAPL", "1day", "2025-11-01 15:00:00");
    }
}
