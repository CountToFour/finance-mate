package com.financemate.income.service;

import com.financemate.expenses.model.PeriodType;
import com.financemate.income.model.Income;
import com.financemate.income.model.RecurringIncome;
import com.financemate.income.repository.IncomeRepository;
import com.financemate.income.repository.RecurringIncomeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RecurringIncomeService {

    private final RecurringIncomeRepository recurringIncomeRepository;
    private final IncomeRepository incomeRepository;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void generateRecurringExpenses() {
        LocalDate today = LocalDate.now();

        for (RecurringIncome recurring : recurringIncomeRepository.findAllByActive(true)) {

            LocalDate lastGenerated = recurring.getLastGeneratedDate();
            LocalDate nextDate = calculateNextDate(lastGenerated == null ? recurring.getDate() : lastGenerated, recurring.getPeriodType());

            if (!nextDate.isAfter(today)) {
                Income income = new Income();
                income.setUserId(recurring.getUserId());
                income.setSource(recurring.getSource());
                income.setAmount(recurring.getAmount());
                income.setDate(nextDate);
                income.setDescription(recurring.getDescription());
                incomeRepository.save(income);

                recurring.setLastGeneratedDate(nextDate);
                recurringIncomeRepository.save(recurring);
            }
        }
    }

    private LocalDate calculateNextDate(LocalDate baseDate, PeriodType type) {
        return switch (type) {
            case DAILY -> baseDate.plusDays(1);
            case WEEKLY -> baseDate.plusWeeks(1);
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY -> baseDate.plusYears(1);
            default -> baseDate;
        };
    }
}
