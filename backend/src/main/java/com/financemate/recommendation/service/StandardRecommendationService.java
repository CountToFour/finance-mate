package com.financemate.recommendation.service;

import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardRecommendationService implements RecommendationService {

    private final TwelveDataClient twelveDataClient;
    private final RsiRecommendationService rsiRecommendationService;
    private final RecommendationRepository recommendationRepository;

    private static final String [] symbols = {"IVV", "BTC/USD", "ETH/USD", "NDAQ", "XAU/USD"};

    @Override
    public List<RsiRecommendation> getRecommendation() {
        LocalDate start = LocalDate.now().minusDays(60);
        start.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        List<RsiRecommendation> recommendations = new ArrayList<>();

        for (String symbol : symbols) {
            TwelveDataTimeSeriesResponse series = twelveDataClient.getTimeSeries(symbol, "1day", start.toString());
            RsiRecommendation rsiRecommendation = rsiRecommendationService.calculateRsi(series);
            if (recommendationRepository.existsBySymbol(rsiRecommendation.getSymbol())) {
                recommendationRepository.findBySymbol(rsiRecommendation.getSymbol()).ifPresent(existing -> {
                    existing.setRsiValue(rsiRecommendation.getRsiValue());
                    existing.setAction(rsiRecommendation.getAction());
                    existing.setLatestClose(rsiRecommendation.getLatestClose());
                    recommendationRepository.save(existing);
                });
            } else {
                recommendationRepository.save(rsiRecommendation);
            }
            recommendations.add(rsiRecommendation);
        }
        return recommendations;
    }
}
