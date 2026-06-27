package finance_mate.core.account.model.dto;

import lombok.Builder;

@Builder
public record AccountResponse(
        String id,
        String name,
        String description,
        double balance,
        String color,
        boolean includeInStats,
        boolean archived
//        CurrencyResponse currency
) { }
