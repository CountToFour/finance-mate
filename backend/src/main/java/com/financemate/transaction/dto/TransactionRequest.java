package com.financemate.transaction.dto;

import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequest {
    private String id;

    @NotBlank(message = "Account ID cannot be empty")
    private String accountId;

    @NotBlank(message = "Category cannot be empty")
    private String categoryId;

    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be greater than 0")
    private double price;

    @Size(max = 255, message = "Description must have max 255 characters")
    private String description;

    @NotNull(message = "Transaction date cannot be null")
    private LocalDate createdAt;

    @NotNull(message = "Period type cannot be null")
    private PeriodType periodType;

    @NotNull(message = "Transaction type cannot be null")
    private TransactionType transactionType;

    private boolean active;
}
