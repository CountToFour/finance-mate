package finance_mate.core.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    //ACCOUNT EXCEPTIONS
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "Account not found"),
    ACCOUNT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Account does not belong to user"),
    ACCOUNT_BALANCE_UPDATE(HttpStatus.BAD_REQUEST, "Balance cannot be changed directly"),
    ACCOUNT_TRANSFER(HttpStatus.BAD_REQUEST, "Cannot transfer to the same account"),
    ACCOUNT_NOT_ENOUGH_MONEY(HttpStatus.BAD_REQUEST, "Insufficient funds in source account"),
    //CATEGORY EXCEPTIONS
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "Category not found"),
    CATEGORY_TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "Category group not found"),
    CATEGORY_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Category does not belong to user"),
    CATEGORY_DELETE(HttpStatus.BAD_REQUEST, "Cannot delete default category"),
    //TRANSACTION EXCEPTIONS
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Transaction not found"),
    TRANSACTION_PERIOD_EXCEPTION(HttpStatus.BAD_REQUEST, "Period type must be specified for recurring expenses."),
    TRANSACTION_RECURRING_NOT_FOUND(HttpStatus.NOT_FOUND, "Recurring transaction not found"),

    //CURRENCY EXCEPTIONS
    CURRENCY_NOT_FOUND(HttpStatus.NOT_FOUND, "Currency not found"),
    CURRENCY_RATE_NOT_FOUND(HttpStatus.NOT_FOUND, "Exchange rate for this currencies not found"),
    CURRENCY_FETCH_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch exchange rate"),
    CURRENCY_ALREADY_EXISTS(HttpStatus.CONFLICT, "This currency already exists");


    private final HttpStatus httpStatus;
    private final String message;
}
