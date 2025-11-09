package com.financemate.account.repository;

import com.financemate.account.model.Account;
import com.financemate.auth.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {

    List<Account> findAllByUserId(User user);
    Optional<Account> findByIdAndUserId(String accountId, User user);
    List<Account> findAllByUserIdAndIncludeInStatsIsTrue(User user);
}
