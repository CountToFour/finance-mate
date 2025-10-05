package com.financemate.transaction.dto;

import com.financemate.transaction.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class TransactionResponse {
    private String id;
    private String accountName;
    private String category;
    private double price;
    private String description;
    private LocalDate createdAt;
    private TransactionType transactionType;
}
