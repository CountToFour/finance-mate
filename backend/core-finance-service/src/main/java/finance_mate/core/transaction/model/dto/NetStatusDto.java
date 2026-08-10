package finance_mate.core.transaction.model.dto;

import finance_mate.core.transaction.model.SafetyNetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class NetStatusDto {
    private SafetyNetStatus safetyNetStatus;
    private double monthsOfSafety;
}
