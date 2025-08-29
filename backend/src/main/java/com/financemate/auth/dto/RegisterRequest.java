package com.financemate.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank String username,
        @Size(min = 8, message = "Hasło musi mieć min 8 znaków") String password
) {}
