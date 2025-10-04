package com.financemate.account.dto;

public record TransferDto(
    String fromAccountId,
    String toAccountId,
    double amount
)
{ }
