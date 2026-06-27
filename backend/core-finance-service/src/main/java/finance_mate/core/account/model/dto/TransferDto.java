package finance_mate.core.account.model.dto;

public record TransferDto(
    String fromAccountId,
    String toAccountId,
    double amount
)
{ }
