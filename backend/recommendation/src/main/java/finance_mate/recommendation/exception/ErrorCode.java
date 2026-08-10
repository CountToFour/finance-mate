package finance_mate.recommendation.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    RSI_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "Error while calculating RSI: "),
    SAVINGS_RATE_EXCEPTION(HttpStatus.BAD_REQUEST, "Cannot calculate savings rate for this user"),
    TRANSACTION_CONNECTION_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "Error while connecting to transaction service"),
    TWELVE_DATA_SERVER_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "Twelve data internal server exception"),
    TWELVE_DATA_CLIENT_EXCEPTION(HttpStatus.BAD_REQUEST, "Client exception while getting a market status");

    private final HttpStatus httpStatus;
    private final String message;
}
