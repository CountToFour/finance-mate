package com.financemate.recommendation.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MLResponse(String status, int score, double confidence,
                         @JsonProperty("primary_issue") String primaryIssue) {
}
