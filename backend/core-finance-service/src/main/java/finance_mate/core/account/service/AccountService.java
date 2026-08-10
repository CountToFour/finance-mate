package finance_mate.core.account.service;

import finance_mate.core.account.model.Account;
import finance_mate.core.account.model.dto.AccountDto;
import finance_mate.core.account.model.dto.AccountResponse;
import finance_mate.core.account.model.dto.BalanceResponse;

import java.util.List;
import java.util.Optional;

public interface AccountService {

    List<AccountResponse> getAccountForUser(String userId);
    AccountResponse createAccount(AccountDto dto, String userId);
    AccountResponse updateAccount(String accountId, AccountDto dto, String userId);
    void deleteAccount(String accountId, String userId);
    AccountResponse getAccountById(String accountId, String userId);
    void archiveAccount(String accountId, String userId);
    void includeInStats(String accountId, String userId);
    void changeBalance(String accountId, double amount, String userId);
    void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId);
    BalanceResponse getUserBalance(String userId);

    Optional<Account> findByIdAndUserId(String id, String userId);
}
