package com.financemate.account.dto;

import com.financemate.account.dto.validation.CorrectColorHex;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record AccountDto(
    @NotBlank(message = "Name cannot be empty") String name,
    String description,
    @NotBlank(message = "Currency must be chosen") String currencyCode,
    @Positive(message = "Account balance must be positive") double balance,
    @NotBlank(message = "Color cannot be empty") @CorrectColorHex String color
)
{ }
