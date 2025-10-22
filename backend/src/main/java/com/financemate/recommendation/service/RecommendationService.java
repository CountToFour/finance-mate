package com.financemate.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financemate.recommendation.dto.BudgetRecommendationResponse;
import com.financemate.recommendation.dto.RecommendationRequest;
import com.financemate.recommendation.dto.RecommendationResponse;
import com.financemate.recommendation.model.RecommendationEntity;
import com.financemate.recommendation.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final RecommendationRepository recommendationRepository;
    private final ObjectMapper objectMapper;

    @Value("${ml.service.url:http://ml-service:5000/predict/recommendations}")
    private String mlServiceUrl;

//    public BudgetRecommendationResponse getBudgetRecommendations(List<String> categories, double totalSpent) {
//
//    }

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RecommendationRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<RecommendationResponse> resp =
                restTemplate.exchange(mlServiceUrl, HttpMethod.POST, entity, RecommendationResponse.class);

        RecommendationResponse body = resp.getBody();

        // save to DB for auditing & feedback
        try {
            RecommendationEntity entityDb = new RecommendationEntity();
            entityDb.setUserId(request.userId());
            entityDb.setPayload(objectMapper.writeValueAsString(body));
            entityDb.setModelVersion(body != null ? body.modelVersion() : null);
            recommendationRepository.save(entityDb);
        } catch (Exception e) {
            // log but don't break response
            e.printStackTrace();
        }

        return body;
    }

    public void saveFeedback(Long recommendationId, String feedbackType, String comment, Long userId) {
        RecommendationEntity rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));

        // Basic authorization: ensure user owns record (in production use proper auth)
        if (!rec.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        if ("ACCEPT".equalsIgnoreCase(feedbackType)) rec.setStatus(RecommendationEntity.Status.ACCEPTED);
        else if ("REJECT".equalsIgnoreCase(feedbackType)) rec.setStatus(RecommendationEntity.Status.REJECTED);
        // could store comment in a separate table
        recommendationRepository.save(rec);
    }

    public List<RecommendationEntity> getUserRecommendations(Long userId) {
        return recommendationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
