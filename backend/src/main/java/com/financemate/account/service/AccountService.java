package com.financemate.account.service;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.model.Account;
import com.financemate.auth.model.user.User;

import java.util.List;

public interface AccountService {

    List<Account> getAccountForUser(User user);
    Account createAccount(AccountDto dto, User user);
    Account updateAccount(String accountId, AccountDto dto, User user);
    void deleteAccount(String accountId, User user);
    Account getAccountById(String accountId, User user);
    void archiveAccount(String accountId, User user);
    void includeInStats(String accountId, User user);
    void changeBalance(String accountId, double amount, User user);
    void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, User user);
    double getUserBalance(User user);
}
