package com.financemate.transaction.repository;

import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, String> {
    List<RecurringTransaction> findAllByActive(boolean active);
    List<RecurringTransaction> findAllByUserId(String userId);
    List<RecurringTransaction> findAllByUserIdAndTransactionType(String userId, TransactionType type);
}
