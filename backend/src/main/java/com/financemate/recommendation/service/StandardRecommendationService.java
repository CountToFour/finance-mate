package com.financemate.recommendation.service;

import com.financemate.account.model.ExchangeRate;
import com.financemate.account.repository.ExchangeRateRepository;
import com.financemate.account.service.AccountService;
import com.financemate.auth.model.user.User;
import com.financemate.budget.dto.GoalRecommendationDto;
import com.financemate.budget.model.FinancialGoal;
import com.financemate.budget.repository.FinancialGoalRepository;
import com.financemate.category.model.Category;
import com.financemate.category.model.CategoryGroup;
import com.financemate.category.repository.CategoryRepository;
import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.InvestmentProfile;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.RecommendationDto;
import com.financemate.recommendation.model.dto.SmartRecommendationDto;
import com.financemate.recommendation.model.dto.SpendingStructureDto;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.repository.RecommendationRepository;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
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
    private final AccountService accountService;
    private final FinancialGoalRepository goalRepository;
    private final CategoryRepository categoryRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    private static final Map<String, String> FRIENDLY_NAMES = Map.of(
            "IVV", "S&P 500 ETF",
            "BTC/USD", "Bitcoin",
            "ETH/USD", "Ethereum",
            "NDAQ", "Nasdaq",
            "XAU/USD", "Złoto"
    );

    @Override
    public List<RsiRecommendation> getRecommendation() {
        return recommendationRepository.findAll();
    }

    @Scheduled(cron = "0 0 6,18 * * *")
//    @PostConstruct
    public void updateRecommendations() {
        log.info("Starting updating stocks recommendations...");

        LocalDate start = LocalDate.now().minusDays(60); // Potrzebujemy historii do RSI

        for (Map.Entry<String, String> entry : FRIENDLY_NAMES.entrySet()) {
            try {
                TwelveDataTimeSeriesResponse series = twelveDataClient.getTimeSeries(entry.getKey(), "1day", start.toString());

                RsiRecommendation calculated = rsiRecommendationService.calculateRsi(series);

                recommendationRepository.findBySymbol(calculated.getSymbol())
                        .ifPresentOrElse(existing -> {
                            existing.setRsiValue(calculated.getRsiValue());
                            existing.setAction(calculated.getAction());
                            existing.setLatestClose(calculated.getLatestClose());
                            existing.setLatestDatetime(calculated.getLatestDatetime());
                            recommendationRepository.save(existing);
                            log.debug("Updated: {}", entry.getKey());
                        }, () -> {
                            recommendationRepository.save(calculated);
                            log.debug("Added new: {}", entry.getKey());
                        });

            } catch (Exception e) {
                log.error("Failed to update symbol recommendation: {}", entry.getKey(), e);
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
        } else if (savingsRate >= 0.05 && savingsRate <= 0.15) {
            profile = InvestmentProfile.CONSERVATIVE;
            allowedSymbols = List.of("XAU/USD");
            message = "Niski bufor bezpieczeństwa. Sugerujemy aktywa chroniące kapitał (Złoto).";
        } else if (savingsRate < 0.35) {
            profile = InvestmentProfile.BALANCED;
            allowedSymbols = List.of("IVV", "XAU/USD");
            message = "Stabilna sytuacja. Buduj zrównoważony portfel (S&P 500, Złoto).";
        } else {
            profile = InvestmentProfile.AGGRESSIVE;
            allowedSymbols = List.of("BTC/USD", "ETH/USD", "NDAQ");
            message = "Wysoka nadwyżka finansowa. Możesz pozwolić sobie na aktywa ryzykowne (Krypto, Tech).";
        }

        String userCurrency = user.getMainCurrency().getCode();
        double rateToUserCurrency = 1.0;

        if (!"USD".equals(userCurrency)) {
            rateToUserCurrency = exchangeRateRepository.findByFromCurrencyAndToCurrency("USD", userCurrency)
                    .map(ExchangeRate::getRate)
                    .orElse(1.0);
        }

        final double finalRate = rateToUserCurrency;

        List<RecommendationDto> recommendations = allRecommendations.stream()
                .filter(rec -> allowedSymbols.contains(rec.getSymbol()))
                .map(rec -> new RecommendationDto(
                        rec.getSymbol(),
                        FRIENDLY_NAMES.getOrDefault(rec.getSymbol(), rec.getSymbol()),
                        rec.getRsiValue(),
                        rec.getAction(),
                        rec.getLatestClose() * finalRate,
                        userCurrency
                ))
                .toList();

        double totalBalance = accountService.getUserBalance(user).balance();

        double avgMonthlyExpenses = transactionService.getAverageMonthlyExpenses(user, 3);
        if (avgMonthlyExpenses == 0) avgMonthlyExpenses = 1;

        double monthsOfSafety = totalBalance / avgMonthlyExpenses;

        String safetyNetStatus;
        if (monthsOfSafety < 1) {
            safetyNetStatus = "DANGER";
        } else if (monthsOfSafety < 3) {
            safetyNetStatus = "WARNING";
        } else if (monthsOfSafety < 6) {
            safetyNetStatus = "SAFE";
        } else {
            safetyNetStatus = "EXCELLENT";
        }

        boolean hasEnoughData = transactionService.hasSufficientExpenseData(user, 30, 10);

        String forecastStatus;
        double projectedBalance = 0;
        double safeDailyLimit = 0;
        double safetyMarginPercent = 0.0;

        if (!hasEnoughData) {
            forecastStatus = "INSUFFICIENT_DATA";
        } else {
            double avgDailySpend = transactionService.getAverageDailySpend(user, 30);

            if (avgDailySpend < 1) avgDailySpend = 1;

            LocalDate today = LocalDate.now();
            LocalDate lastDayOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, lastDayOfMonth) + 1;

            double projectedExpenses = daysLeft * avgDailySpend;
            projectedBalance = totalBalance - projectedExpenses;

            if (totalBalance > 0 && projectedBalance > 0) {
                safetyMarginPercent = (projectedBalance / totalBalance) * 100.0;
            } else if (projectedBalance <= 0) {
                safetyMarginPercent = 0.0;
            }

            safeDailyLimit = daysLeft > 0 ? totalBalance / daysLeft : totalBalance;

            if (projectedBalance < 0) {
                forecastStatus = "CRITICAL";
            } else if (projectedBalance < (totalBalance * 0.1)) {
                forecastStatus = "WARNING";
            } else {
                forecastStatus = "STABLE";
            }
        }

        return SmartRecommendationDto.builder()
                .profile(profile)
                .savingsRate(savingsRate)
                .recommendations(recommendations)
                .message(message)
                .safetyNetStatus(safetyNetStatus)
                .monthsOfSafety(monthsOfSafety)
                .forecastStatus(forecastStatus)
                .projectedBalanceEndOfMonth(projectedBalance)
                .dailySafeSpend(safeDailyLimit)
                .safetyMarginPercent(Math.round(safetyMarginPercent))
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

    @Override
    public GoalRecommendationDto getGoalRecommendation(User user) {
        List<FinancialGoal> goals = goalRepository.findByUser(user).stream()
                .filter(g -> !g.isCompleted())
                .sorted(Comparator.comparing(FinancialGoal::getDeadline))
                .toList();

        if (goals.isEmpty()) return null; // Brak celów do analizy
        FinancialGoal targetGoal = goals.get(0);

        LocalDate start = LocalDate.now().minusDays(30);
        LocalDate end = LocalDate.now();

        List<TransactionResponse> expenses = transactionService.getTransactionsByUser(
                user, null, null, null, start, end, TransactionType.EXPENSE, null
        );

        Map<String, CategoryGroup> userCats = categoryRepository.findAllByUser(user).stream()
                .collect(Collectors.toMap(
                        Category::getName,
                        c -> c.getCategoryGroup() != null ? c.getCategoryGroup() : CategoryGroup.NEEDS,
                        (a, b) -> a
                ));

        Map<String, Double> wantsSpending = new HashMap<>();
        for (TransactionResponse tx : expenses) {
            if (userCats.get(tx.getCategory()) == CategoryGroup.WANTS) {
                wantsSpending.merge(tx.getCategory(), Math.abs(tx.getPrice()), Double::sum);
            }
        }

        if (wantsSpending.isEmpty()) return null;

        Map.Entry<String, Double> topWant = wantsSpending.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElseThrow();

        double potentialSavings = topWant.getValue() * 0.25;

        double remainingAmount = targetGoal.getTargetAmount() - targetGoal.getCurrentAmount();

        double avgMonthlyIncome = transactionService.getAverageMonthlyIncome(user, 3);
        double savingsRate = transactionService.calculateQuarterlySavingsRate(user);

        double currentMonthlySavings;

        if (targetGoal.getMonthlyContribution() > 0) {
            currentMonthlySavings = targetGoal.getMonthlyContribution();
        } else {
            currentMonthlySavings = (savingsRate > 0) ? avgMonthlyIncome * savingsRate : 0.0;
        }

        if (currentMonthlySavings < 1) currentMonthlySavings = 1.0;

        double monthsCurrentPace = remainingAmount / currentMonthlySavings;
        double monthsFasterPace = remainingAmount / (currentMonthlySavings + potentialSavings);

        int monthsSaved = (int) Math.ceil(monthsCurrentPace) - (int) Math.ceil(monthsFasterPace);
        double rawDiff = monthsCurrentPace - monthsFasterPace;

        if (rawDiff < 0.5) {
            return null;
        }
        if (monthsSaved < 1 && rawDiff >= 0.5) {
            monthsSaved = 1;
        }

        String baseMessagePart = targetGoal.getMonthlyContribution() > 0
                ? String.format("Przy Twojej wpłacie %.0f zł/mies", currentMonthlySavings)
                : String.format("Przy obecnym tempie oszczędzania (ok. %.0f zł/mies)", currentMonthlySavings);

        String message = String.format(
                "Twój cel '%s' wymaga jeszcze %.0f zł. %s, " +
                        "ograniczenie wydatków na '%s' o połowę pozwoli Ci osiągnąć cel o %d mies. szybciej!",
                targetGoal.getName(), remainingAmount, baseMessagePart, topWant.getKey(), monthsSaved
        );

        return new GoalRecommendationDto(
                targetGoal.getName(),
                topWant.getKey(),
                Math.round(potentialSavings),
                monthsSaved,
                message
        );
    }

}