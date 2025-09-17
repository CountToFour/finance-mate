package com.financemate.expenses.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.hibernate.annotations.SecondaryRow;

import java.math.BigDecimal;

@Getter
@SecondaryRow
@AllArgsConstructor
public class CategoryDto {
    String category;
    BigDecimal amount;
    int transactions;
    double percentage;
}
