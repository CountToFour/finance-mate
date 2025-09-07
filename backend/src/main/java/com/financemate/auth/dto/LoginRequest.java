package com.financemate.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email @NotBlank(message = "Email cannot be empty")
        String email,
        @NotBlank(message = "Email cannot be empty")
        String password
) {}
