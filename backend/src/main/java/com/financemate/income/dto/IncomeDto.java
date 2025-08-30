package com.financemate.income.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeDto {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Income source is required")
    private String source;

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Size(max = 255, message = "Description must have max 255 characters")
    private String description;
}
