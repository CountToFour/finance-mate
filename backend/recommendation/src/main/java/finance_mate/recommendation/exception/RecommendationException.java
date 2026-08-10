package finance_mate.recommendation.exception;

import lombok.Getter;

@Getter
public class RecommendationException extends RuntimeException {
    private final ErrorCode errorCode;

    public RecommendationException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public RecommendationException(ErrorCode errorCode, String message) {
        super(errorCode.getMessage() + " / " + message);
        this.errorCode = errorCode;
    }
}
