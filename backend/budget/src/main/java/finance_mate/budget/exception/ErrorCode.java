package finance_mate.budget.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum ErrorCode {
    BUDGET_EXISTS_ERROR(HttpStatus.BAD_REQUEST, "Budget for this category already exists"),
    BUDGET_NOT_FOUND(HttpStatus.NOT_FOUND, "Budget not found"),

    FINANCIAL_GOAL_NOT_FOUND(HttpStatus.NOT_FOUND, "Financial goal not found"),
    FINANCIAL_GOAL_LOCKED_EXCEPTION(HttpStatus.BAD_REQUEST, "Funds in this goal are locked"),
    FINANCIAL_GOAL_FUNDS_EXCEPTION(HttpStatus.BAD_REQUEST, "Not enough saved funds in the goal"),

    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "Category does not exists"),
    CATEGORY_TYPE_EXCEPTION(HttpStatus.BAD_REQUEST, "Invalid category type"),
    CATEGORY_SERVICE_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus httpStatus;
    private final String message;

}
