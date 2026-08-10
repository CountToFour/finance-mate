package finance_mate.recommendation.service;


import finance_mate.recommendation.model.RsiRecommendation;
import finance_mate.recommendation.model.UserProfile;
import finance_mate.recommendation.model.dto.GoalRecommendationDto;
import finance_mate.recommendation.model.dto.InvestmentRecommendationDto;
import finance_mate.recommendation.model.dto.SmartRecommendationDto;
import finance_mate.recommendation.model.dto.SpendingStructureDto;

import java.util.List;

public interface RecommendationService {
    List<RsiRecommendation> getRecommendation();

    UserProfile calculateUserProfile(String userId);

    InvestmentRecommendationDto getSmartInvestmentRecommendation(String userId);
//    SmartRecommendationDto getSmartRecommendation(String userId);
//    SpendingStructureDto getSpendingAuditor(String userId);
//    GoalRecommendationDto getGoalRecommendation(String userId);
}
