package com.financemate.transaction.service;

import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.repository.TransactionRepository;
import com.financemate.transaction.repository.RecurringTransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;

    public RecurringTransactionService(RecurringTransactionRepository recurringTransactionRepository,
                                       TransactionRepository transactionRepository) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void generateRecurringExpenses() {
        LocalDate today = LocalDate.now().plusDays(1);

        for (RecurringTransaction recurring : recurringTransactionRepository.findAllByActive(true)) {

            LocalDate nextDate = recurring.getExpenseDate();

            if (today.isAfter(nextDate) || today.equals(nextDate)) {
                Transaction transaction = new Transaction();
                transaction.setUser(recurring.getUser());
                transaction.setCategory(recurring.getCategory());
                transaction.setPrice(recurring.getPrice());
                transaction.setCreatedAt(nextDate);
                transaction.setDescription(recurring.getDescription());
                transaction.setTransactionType(recurring.getType());
                transactionRepository.save(transaction);

                if (recurring.getPeriodType() == PeriodType.ONCE) {
                    recurringTransactionRepository.delete(recurring);
                } else {
                    recurring.setExpenseDate(calculateNextDate(nextDate, recurring.getPeriodType()));
                    recurringTransactionRepository.save(recurring);
                }
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
