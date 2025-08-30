package com.financemate.expenses.service;

import com.financemate.expenses.model.Expense;
import com.financemate.expenses.model.PeriodType;
import com.financemate.expenses.model.RecurringExpense;
import com.financemate.expenses.repository.ExpenseRepository;
import com.financemate.expenses.repository.RecurringExpenseRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;

    public RecurringExpenseService(RecurringExpenseRepository recurringExpenseRepository,
                                   ExpenseRepository expenseRepository) {
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.expenseRepository = expenseRepository;
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void generateRecurringExpenses() {
        LocalDate today = LocalDate.now();

        for (RecurringExpense recurring : recurringExpenseRepository.findAllByActive(true)) {

            LocalDate lastGenerated = recurring.getLastGeneratedDate();
            LocalDate nextDate = calculateNextDate(lastGenerated == null ? recurring.getExpenseDate() : lastGenerated, recurring.getPeriodType());

            if (!nextDate.isAfter(today)) {
                Expense expense = new Expense();
                expense.setUserId(recurring.getUserId());
                expense.setCategory(recurring.getCategory());
                expense.setPrice(recurring.getPrice());
                expense.setExpenseDate(nextDate);
                expense.setDescription(recurring.getDescription());
                expenseRepository.save(expense);

                recurring.setLastGeneratedDate(nextDate);
                recurringExpenseRepository.save(recurring);
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
