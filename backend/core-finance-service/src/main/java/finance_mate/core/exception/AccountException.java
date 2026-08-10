package finance_mate.core.exception;

import lombok.Getter;

@Getter
public class AccountException extends RuntimeException {
    private final ErrorCode errorCode;

    public AccountException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
