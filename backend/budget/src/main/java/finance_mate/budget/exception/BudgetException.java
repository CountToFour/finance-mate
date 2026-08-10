package finance_mate.budget.exception;

import lombok.Getter;

@Getter
public class BudgetException extends RuntimeException {
    private final ErrorCode errorCode;

    public BudgetException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
