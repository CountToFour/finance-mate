package com.financemate.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, String username, String email, String id, String locale) {
    public AuthResponse(String accessToken, String refreshToken, String username, String email, String id, String locale) {
        this(accessToken, refreshToken, "Bearer", username, email, id, locale);
    }
}