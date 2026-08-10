package finance_mate.core.transaction.repository;

import finance_mate.core.transaction.model.Transaction;
import finance_mate.core.transaction.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, String>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByUserId(String userId);

    Optional<Transaction> findById(String id);

    @Query(
            "SELECT SUM(t.price) FROM Transaction t " +
                    "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
                    "AND t.userId = :userId"
    )
    Double calculateSum(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                        @Param("userId") String userId);

    @Query(
            "SELECT COUNT(t.id) FROM Transaction t " +
                    "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
                    "AND t.userId = :userId"
    )
    int getCount(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                 @Param("userId") String userId);

    @Query(
            "SELECT SUM(t.price) FROM Transaction t " +
                    "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
                    "AND t.transactionType = :type AND t.userId = :userId"
    )
    Double getTotalAmount(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                          @Param("type") TransactionType type, @Param("userId") String userId);
}
