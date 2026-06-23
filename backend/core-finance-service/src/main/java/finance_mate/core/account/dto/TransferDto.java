package finance_mate.core.account.dto;

public record TransferDto(
    String fromAccountId,
    String toAccountId,
    double amount
)
{ }
