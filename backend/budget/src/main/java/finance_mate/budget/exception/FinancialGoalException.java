package finance_mate.budget.exception;

import lombok.Getter;

@Getter
public class FinancialGoalException extends RuntimeException {
    private final ErrorCode errorCode;

    public FinancialGoalException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
