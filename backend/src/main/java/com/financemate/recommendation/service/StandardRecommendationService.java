package com.financemate.recommendation.service;

import com.financemate.auth.model.user.User;
import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.InvestmentProfile;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.SmartRecommendationDto;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.repository.RecommendationRepository;
import com.financemate.transaction.service.TransactionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandardRecommendationService implements RecommendationService {

    private final TwelveDataClient twelveDataClient;
    private final RsiRecommendationService rsiRecommendationService;
    private final RecommendationRepository recommendationRepository;
    private final TransactionService transactionService;

    private static final String[] SYMBOLS = {"IVV", "BTC/USD", "ETH/USD", "NDAQ", "XAU/USD"};

    @Override
    public List<RsiRecommendation> getRecommendation() {
        return recommendationRepository.findAll();
    }

    @Scheduled(cron = "0 0 6,18 * * *")
    @PostConstruct
    public void updateRecommendations() {
        log.info("Starting updating stocks recommendations...");

        LocalDate start = LocalDate.now().minusDays(60); // Potrzebujemy historii do RSI

        for (String symbol : SYMBOLS) {
            try {
                TwelveDataTimeSeriesResponse series = twelveDataClient.getTimeSeries(symbol, "1day", start.toString());

                RsiRecommendation calculated = rsiRecommendationService.calculateRsi(series);

                recommendationRepository.findBySymbol(calculated.getSymbol())
                        .ifPresentOrElse(existing -> {
                            existing.setRsiValue(calculated.getRsiValue());
                            existing.setAction(calculated.getAction());
                            existing.setLatestClose(calculated.getLatestClose());
                            existing.setLatestDatetime(calculated.getLatestDatetime());
                            recommendationRepository.save(existing);
                            log.debug("Updated: {}", symbol);
                        }, () -> {
                            recommendationRepository.save(calculated);
                            log.debug("Added new: {}", symbol);
                        });

            } catch (Exception e) {
                log.error("Failed to update symbol recommendation: {}", symbol, e);
            }
        }
        log.info("Finished recommendation updates.");
    }

    @Override
    public SmartRecommendationDto getSmartRecommendation(User user) {
        List<RsiRecommendation> allRecommendations = getRecommendation();
        double savingsRate = transactionService.calculateQuarterlySavingsRate(user);

        InvestmentProfile profile;
        List<String> allowedSymbols;
        String message;

        if (savingsRate < 0) {
            profile = InvestmentProfile.CRITICAL;
            allowedSymbols = List.of();
            message = "Twoje wydatki przekraczają przychody. Skup się na naprawie budżetu domowego.";
        } else if (savingsRate < 0.20) {
            profile = InvestmentProfile.CONSERVATIVE;
            allowedSymbols = List.of("XAU/USD");
            message = "Niski bufor bezpieczeństwa. Sugerujemy aktywa chroniące kapitał (Złoto).";
        } else if (savingsRate < 0.50) {
            profile = InvestmentProfile.BALANCED;
            allowedSymbols = List.of("IVV", "XAU/USD");
            message = "Stabilna sytuacja. Buduj zrównoważony portfel (S&P 500, Złoto).";
        } else {
            profile = InvestmentProfile.AGGRESSIVE;
            allowedSymbols = List.of("BTC/USD", "ETH/USD", "NDAQ");
            message = "Wysoka nadwyżka finansowa. Możesz pozwolić sobie na aktywa wzrostowe (Krypto, Tech).";
        }

        List<RsiRecommendation> filtered = allRecommendations.stream()
                .filter(rec -> allowedSymbols.contains(rec.getSymbol()))
                .toList();

        return SmartRecommendationDto.builder()
                .profile(profile)
                .savingsRate(savingsRate)
                .recommendations(filtered)
                .message(message)
                .build();
    }
}