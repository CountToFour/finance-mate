package com.financemate.auth.dto;

import com.financemate.account.model.Currency;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, String username, String email, String id, String locale, Currency currency) {
    public AuthResponse(String accessToken, String refreshToken, String username, String email, String id, String locale, Currency currency) {
        this(accessToken, refreshToken, "Bearer", username, email, id, locale, currency);
    }
}