package com.financemate.recommendation.model.dto;

import com.financemate.recommendation.model.InvestmentProfile;
import com.financemate.recommendation.model.RsiRecommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartRecommendationDto {
    private InvestmentProfile profile;
    private double savingsRate;
    private List<RecommendationDto> recommendations;
    private String message;

    private String safetyNetStatus;
    private double monthsOfSafety;

    private String forecastStatus;
    private double projectedBalanceEndOfMonth;
    private double dailySafeSpend;
    private double safetyMarginPercent;
}