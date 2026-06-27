package finance_mate.core.transaction.repository;

import finance_mate.core.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, String>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByUserId(String userId);
    Optional<Transaction> findById(String id);
}
