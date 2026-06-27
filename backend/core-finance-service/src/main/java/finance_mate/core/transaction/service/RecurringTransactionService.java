package finance_mate.core.transaction.service;

import finance_mate.core.transaction.model.PeriodType;
import finance_mate.core.transaction.model.RecurringTransaction;
import finance_mate.core.transaction.model.Transaction;
import finance_mate.core.transaction.repository.RecurringTransactionRepository;
import finance_mate.core.transaction.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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

        LocalDate today = LocalDate.now().plusDays(0);

        List<Transaction> transactionsToSave = new ArrayList<>();
        List<RecurringTransaction> recurringToUpdate = new ArrayList<>();
        List<RecurringTransaction> recurringToDelete = new ArrayList<>();

        for (RecurringTransaction recurring : recurringTransactionRepository.findAllByActive(true)) {

            LocalDate nextDate = recurring.getCreatedAt();

            if (today.isAfter(nextDate) || today.equals(nextDate)) {
                Transaction transaction = new Transaction();
                transaction.setUserId(recurring.getUserId());
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
