package com.financemate.recommendation.model.dto;

public record MLRequest(
        double needs_ratio, double wants_ratio, double savings_ratio,
        double needs_trend, double spending_volatility,
        double small_tx_ratio, double safety_net_ratio
) {}
