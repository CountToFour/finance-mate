package com.financemate.transaction.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategorySpentDto {
    private String categoryId;
    private double totalSpent;
}
