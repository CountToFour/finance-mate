package com.financemate.recommendation.service;

import com.financemate.auth.model.user.User;
import com.financemate.category.model.Category;
import com.financemate.category.model.CategoryGroup;
import com.financemate.category.repository.CategoryRepository;
import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.InvestmentProfile;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.SmartRecommendationDto;
import com.financemate.recommendation.model.dto.SpendingStructureDto;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.repository.RecommendationRepository;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.service.TransactionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
//    @PostConstruct
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

    @Override
    public SpendingStructureDto getSpendingAuditor(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(90);

        double totalIncome90Days = transactionService.getIncome(user, startDate, endDate);

        if (totalIncome90Days == 0) {
            return new SpendingStructureDto(0, 0, 0, 0, "Brak danych o przychodach z ostatnich 90 dni.");
        }

        Map<CategoryGroup, Map<String, Double>> categoryDetails = transactionService.getSpendingDetailsByGroup(user, startDate, endDate);

        double needsTotal = sumGroup(categoryDetails, CategoryGroup.NEEDS) / 3.0;
        double wantsTotal = sumGroup(categoryDetails, CategoryGroup.WANTS) / 3.0;
        double savingsTotal = sumGroup(categoryDetails, CategoryGroup.SAVINGS) / 3.0;

        double avgMonthlyIncome = totalIncome90Days / 3.0;

        double unallocated = avgMonthlyIncome - (needsTotal + wantsTotal + savingsTotal);
        if (unallocated > 0) savingsTotal += unallocated;

        double needsPct = (needsTotal / avgMonthlyIncome) * 100;
        double wantsPct = (wantsTotal / avgMonthlyIncome) * 100;
        double savingsPct = (savingsTotal / avgMonthlyIncome) * 100;

        String recommendation = generateActionableRecommendation(
                needsPct, wantsPct, savingsPct,
                avgMonthlyIncome, categoryDetails
        );

        return new SpendingStructureDto(
                Math.round(needsPct),
                Math.round(wantsPct),
                Math.round(savingsPct),
                Math.round(avgMonthlyIncome * 100.0) / 100.0,
                recommendation
        );
    }

    private double sumGroup(Map<CategoryGroup, Map<String, Double>> details, CategoryGroup group) {
        return details.getOrDefault(group, Map.of())
                .values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private String generateActionableRecommendation(
            double needsPct, double wantsPct, double savingsPct,
            double income, Map<CategoryGroup, Map<String, Double>> details) {

        if (needsPct >= 51) {
            double excessAmount = (needsPct - 50) / 100 * income;
            String topCategory = findTopCategory(details.get(CategoryGroup.NEEDS));

            return String.format(
                    "Koszty życia wynoszą %.0f%% (limit 50%%). Główny winowajca to '%s'. " +
                            "Spróbuj obniżyć te koszty średnio o %.0f zł miesięcznie w nadchodzącym kwartale.",
                    needsPct, topCategory, excessAmount
            );
        }

        if (wantsPct >= 31) {
            double excessAmount = (wantsPct - 30) / 100 * income;
            String topCategory = findTopCategory(details.get(CategoryGroup.WANTS));

            return String.format(
                    "Wydajesz na przyjemności %.0f%% (limit 30%%). Główny winowajca to '%s'. " +
                            "Zmniejsz wydatki w nadchodzących 3 miesiącach o średnio %.0f zł.",
                    wantsPct, topCategory, excessAmount
            );
        }

        if (savingsPct <= 20) {
            double missingSavings = (20 - savingsPct) / 100 * income;
            return String.format(
                    "Oszczędzasz %.0f%% (cel 20%%). Aby to naprawić, zwiększ kwotę przelewów na oszczędności " +
                            "o średnio %.0f zł w kolejnych miesiącach.",
                    savingsPct, missingSavings
            );
        }

        return "Twoja struktura finansowa (50/30/20) jest wzorowa! Tak trzymaj.";
    }

    private String findTopCategory(Map<String, Double> categories) {
        if (categories == null || categories.isEmpty()) return "Inne";

        return categories.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Nieznana");
    }

}