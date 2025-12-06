package com.financemate.recommendation.model;

/*
    @CRITICAL - negative balance
    @CONSERVATIVE (<20%)
    @BALANCED (20-50%)
    @AGGRESIVE (>50%)
 */

public enum InvestmentProfile {
    CRITICAL,
    CONSERVATIVE,
    BALANCED,
    AGGRESSIVE
}
