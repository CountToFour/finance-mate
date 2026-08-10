package finance_mate.core.account.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CurrencyDto {

    private String code;
    private String name;
    private String symbol;
}
