package finance_mate.budget.model.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateBudgetDto {
    @Positive(message = "Limit amount must be a number greater than 0")
    double limitAmount;
    @Nullable
    @FutureOrPresent(message = "Start date cannot be in past")
    LocalDate startDate;
    @Nullable
    @FutureOrPresent(message = "End date cannot be in the past")
    LocalDate endDate;
}
