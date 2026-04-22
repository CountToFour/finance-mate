package com.financemate.transaction.service;

import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.repository.TransactionRepository;
import com.financemate.transaction.repository.RecurringTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;

    public RecurringTransactionService(RecurringTransactionRepository recurringTransactionRepository,
                                       TransactionRepository transactionRepository) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
    }

    @Scheduled(cron = "0 21 22 * * ?")
    @Transactional
    public void generateRecurringExpenses() {

        System.out.println("Staring recurring transaction generation at " + LocalDate.now());
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LocalDate today = LocalDate.now().plusDays(0);

        List<Transaction> transactionsToSave = new ArrayList<>();
        List<RecurringTransaction> recurringToUpdate = new ArrayList<>();
        List<RecurringTransaction> recurringToDelete = new ArrayList<>();

        for (RecurringTransaction recurring : recurringTransactionRepository.findAllByActive(true)) {

            LocalDate nextDate = recurring.getCreatedAt();

            if (today.isAfter(nextDate) || today.equals(nextDate)) {
                Transaction transaction = new Transaction();
                transaction.setUser(recurring.getUser());
                transaction.setCategory(recurring.getCategory());
                transaction.setPrice(recurring.getPrice());
                transaction.setCreatedAt(nextDate);
                transaction.setDescription(recurring.getDescription());
                transaction.setTransactionType(recurring.getTransactionType());
                transaction.setAccount(recurring.getAccount());
                transactionsToSave.add(transaction);

                if (recurring.getPeriodType() == PeriodType.ONCE) {
                    recurringToDelete.add(recurring);
                } else {
                    recurring.setCreatedAt(calculateNextDate(nextDate, recurring.getPeriodType()));
                    recurringToUpdate.add(recurring);
                }
            }
        }

        if (!transactionsToSave.isEmpty()) {
            transactionRepository.saveAll(transactionsToSave);
        }
        if (!recurringToUpdate.isEmpty()) {
            recurringTransactionRepository.saveAll(recurringToUpdate);
        }
        if (!recurringToDelete.isEmpty()) {
            recurringTransactionRepository.deleteAll(recurringToDelete);
        }

        stopWatch.stop();
        log.info("Zakończono pobieranie. Czas trwania: {} milisekund ({} sekund)",
                stopWatch.getTotalTimeMillis(),
                stopWatch.getTotalTimeSeconds());
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
