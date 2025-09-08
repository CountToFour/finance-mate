package com.financemate.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, String username, String email, String id) {
    public AuthResponse(String accessToken, String refreshToken, String username, String email, String id) {
        this(accessToken, refreshToken, "Bearer", username, email, id);
    }
}