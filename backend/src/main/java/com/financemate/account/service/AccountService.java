package com.financemate.account.service;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.model.Account;

import java.util.List;

public interface AccountService {

    List<Account> getAccountForUser(String userId);
    Account createAccount(AccountDto dto, String userId);
    Account updateAccount(String accountId, AccountDto dto, String userId);
    void deleteAccount(String accountId, String userId);
    Account getAccountById(String accountId, String userId);
    void archiveAccount(String accountId, String userId);
    void includeInStats(String accountId, String userId);
    Account changeBalance(String accountId, double amount, String userId);
//    void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId);
}
