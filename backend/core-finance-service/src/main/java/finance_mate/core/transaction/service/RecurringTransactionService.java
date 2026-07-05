package finance_mate.core.transaction.service;

import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.EditTransactionDto;
import finance_mate.core.transaction.model.dto.RecurringTransactionResponse;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;

public interface RecurringTransactionService {
    @Transactional
    RecurringTransactionResponse addRecurringTransaction(TransactionRequest dto, String userId);

    List<RecurringTransactionResponse> getAllRecurringTransactions(String userId, TransactionType type);

    @Transactional
    void deleteRecurringTransaction(String id);

    @Transactional
    void deactivateRecurringTransaction(String id);

    @Transactional
    RecurringTransactionResponse editRecurringTransaction(String id, EditTransactionDto dto);

    @Scheduled(cron = "0 21 22 * * ?")
    @Transactional
    void generateRecurringExpenses();
}
