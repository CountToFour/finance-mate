package finance_mate.core.account.model.dto;

import lombok.Builder;

@Builder
public record CurrencyResponse(
        String code, String name, String symbol
) {
}
