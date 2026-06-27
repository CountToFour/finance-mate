package finance_mate.core.transaction.model.dto;

import java.time.LocalDate;

public record DailyOverviewDto(LocalDate date, double amount) {
}
