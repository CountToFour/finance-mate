package com.financemate.transaction.dto;

import java.time.LocalDate;

public record DailyOverviewDto(LocalDate date, double amount) {
}
