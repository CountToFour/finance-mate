package finance_mate.core.exception;

import lombok.Getter;

@Getter
public class CategoryException extends RuntimeException {
    private final ErrorCode errorCode;

    public CategoryException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
