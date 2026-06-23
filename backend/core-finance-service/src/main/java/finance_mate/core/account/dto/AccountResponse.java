package finance_mate.core.account.dto;

import com.financemate.account.dto.CurrencyResponse;

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
