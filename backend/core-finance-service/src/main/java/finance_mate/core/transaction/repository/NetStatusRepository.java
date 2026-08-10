package finance_mate.core.transaction.repository;

import finance_mate.core.transaction.model.NetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NetStatusRepository extends JpaRepository<NetStatus, String> {
    Optional<NetStatus> findByUserId(String userId);
}
