package finance_mate.core.account.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AccountBalanceDto {

    private String userId;
    private double amount;
    private String accountId;
}
