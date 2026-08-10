package finance_mate.recommendation.model.dto;

import finance_mate.recommendation.model.InvestmentProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class InvestmentRecommendationDto {
    List<RecommendationDto> recommendations;
    InvestmentProfile profile;
    double savingsRate;
    String message;
}
