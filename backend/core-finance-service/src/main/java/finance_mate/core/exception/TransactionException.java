package finance_mate.core.exception;

import lombok.Getter;

@Getter
public class TransactionException extends RuntimeException {
    private final ErrorCode errorCode;

    public TransactionException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
