package finance_mate.core.account.model.dto;

import finance_mate.core.account.model.dto.validation.CorrectColorHex;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AccountDto(
    @NotBlank(message = "Name cannot be empty") String name,
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description,
//    @NotBlank(message = "Currency must be chosen") String currencyCode,
    @Positive(message = "Account balance must be positive") double balance,
    @NotBlank(message = "Color cannot be empty") @CorrectColorHex String color
)
{ }
