package finance_mate.core.account.model.dto;

import jakarta.validation.constraints.Positive;

public record TransferDto(
    String fromAccountId,
    String toAccountId,
    @Positive(message = "Transfer amount must be positive") double amount
)
{ }
