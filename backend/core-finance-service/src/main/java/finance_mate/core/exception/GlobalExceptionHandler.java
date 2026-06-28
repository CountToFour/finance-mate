package finance_mate.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccountException.class)
    public ResponseEntity<String> handleAccountError(AccountException ex) {
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(ex.getErrorCode().getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleError(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
    }
}
