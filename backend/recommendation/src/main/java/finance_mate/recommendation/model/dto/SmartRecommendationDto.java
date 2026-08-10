package finance_mate.recommendation.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartRecommendationDto {
    private String forecastStatus;
    private double projectedBalanceEndOfMonth;
    private double dailySafeSpend;
    private double safetyMarginPercent;
}