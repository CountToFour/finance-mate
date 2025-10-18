package com.financemate.transaction.dto;

import com.financemate.transaction.model.PeriodType;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EditTransactionDto(
        @Nullable String accountId,
        @Nullable String categoryId,
        @Nullable @Positive(message = "Price must be greater than 0") Double price,
        @Nullable @Size(max = 255, message = "Description must have max 255 characters") String description,
        @Nullable LocalDate createdAt,
        @Nonnull PeriodType periodType
) {
}
