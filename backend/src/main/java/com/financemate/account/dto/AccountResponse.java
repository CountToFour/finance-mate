package com.financemate.account.dto;

public record AccountResponse(
        String id,
        String name,
        String description,
        double balance,
        String color,
        boolean includeInStats,
        boolean archived,
        CurrencyResponse currency
) { }
