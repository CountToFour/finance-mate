package com.financemate.expenses.dto;

import com.financemate.expenses.model.PeriodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseDto {
    @NotBlank(message = "User ID cannot be empty")
    private String userId;

    @NotBlank(message = "Category cannot be empty")
    private String category;

    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be greater than 0")
    private BigDecimal price;

    @Size(max = 255, message = "Description must have max 255 characters")
    private String description;

    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate expenseDate;

    @NotNull(message = "Period type cannot be null")
    private PeriodType periodType;
}
