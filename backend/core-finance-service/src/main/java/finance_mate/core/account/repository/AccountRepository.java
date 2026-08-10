package finance_mate.core.account.repository;

import finance_mate.core.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {

    List<Account> findAllByUserId(String userId);
    Optional<Account> findByIdAndUserId(String accountId, String userId);
    List<Account> findAllByUserIdAndIncludeInStatsIsTrue(String userId);
}
