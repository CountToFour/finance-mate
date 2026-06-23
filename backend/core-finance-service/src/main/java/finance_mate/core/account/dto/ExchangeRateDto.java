package finance_mate.core.account.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeRateDto {

    String result;
    String base_code;
    String target_code;
    double conversion_rate;
}
