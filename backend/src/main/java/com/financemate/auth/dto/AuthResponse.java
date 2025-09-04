package com.financemate.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, String username, String email) {
    public AuthResponse(String accessToken, String refreshToken, String username, String email) {
        this(accessToken, refreshToken, "Bearer", username, email);
    }
}