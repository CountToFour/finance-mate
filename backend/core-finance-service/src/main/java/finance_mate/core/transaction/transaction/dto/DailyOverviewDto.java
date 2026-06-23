package finance_mate.core.transaction.transaction.dto;

import java.time.LocalDate;

public record DailyOverviewDto(LocalDate date, double amount) {
}
