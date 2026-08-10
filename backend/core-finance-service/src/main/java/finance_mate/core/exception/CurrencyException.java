package finance_mate.core.exception;

import lombok.Getter;

@Getter
public class CurrencyException extends RuntimeException {
    private final ErrorCode errorCode;

    public CurrencyException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
