package com.financemate.recommendation.service;


import com.financemate.auth.model.user.User;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.SmartRecommendationDto;
import com.financemate.recommendation.model.dto.SpendingStructureDto;

import java.util.List;

public interface RecommendationService {
    List<RsiRecommendation> getRecommendation();
    SmartRecommendationDto getSmartRecommendation(User user);

    SpendingStructureDto getSpendingAuditor(User user);
}
