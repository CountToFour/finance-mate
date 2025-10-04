package com.financemate.account.service;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.model.Account;
import com.financemate.account.model.Currency;
import com.financemate.account.repository.AccountRepository;
import com.financemate.account.repository.CurrencyRepository;
import com.financemate.account.repository.ExchangeRateRepository;
import com.financemate.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class StandardAccountService implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    public StandardAccountService(AccountRepository accountRepository,
                                  UserRepository userRepository,
                                  CurrencyRepository currencyRepository,
                                  ExchangeRateRepository exchangeRateRepository) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.currencyRepository = currencyRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public List<Account> getAccountForUser(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return accountRepository.findAllByUserId(userId);
    }

    @Override
    public Account createAccount(AccountDto dto, String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new IllegalArgumentException("Currency not found"));

        Account account = new Account();
        account.setName(dto.name());
        account.setDescription(dto.description());
        account.setCurrencyCode(dto.currencyCode());
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        account.setUserId(userId);
        account.setIncludeInStats(true);
        account.setArchived(false);

        return accountRepository.save(account);
    }

    @Override
    public Account updateAccount(String accountId, AccountDto dto, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }

        if (account.getBalance() != dto.balance()) {
            throw new IllegalArgumentException("Balance cannot be changed directly");
        }

        if (!Objects.equals(account.getCurrencyCode(), dto.currencyCode())) {
            throw new IllegalArgumentException("Currency cannot be changed");
        }
        account.setName(dto.name());
        account.setDescription(dto.description());
        account.setCurrencyCode(dto.currencyCode());
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        return accountRepository.save(account);
    }

    @Override
    public void deleteAccount(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }
        accountRepository.delete(account);
    }

    @Override
    public Account getAccountById(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }
        return account;
    }

    @Override
    public void archiveAccount(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }
        account.setArchived(!account.isArchived());
        accountRepository.save(account);
    }

    @Override
    public void includeInStats(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }
        account.setIncludeInStats(!account.isIncludeInStats());
        accountRepository.save(account);
    }

    @Override
    public Account changeBalance(String accountId, double amount, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Account does not belong to user");
        }
        account.setBalance(account.getBalance() + amount);
        return accountRepository.save(account);
    }

    @Override
    public void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow(()
                -> new IllegalArgumentException("Source account not found"));
        Account toAccount = accountRepository.findById(toAccountId).orElseThrow(()
                -> new IllegalArgumentException("Destination account not found"));

        if (!fromAccount.getUserId().equals(userId) || !toAccount.getUserId().equals(userId)) {
            throw new IllegalArgumentException("One or both accounts do not belong to user");
        }

        if (fromAccount.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient funds in source account");
        }

        double finalAmount;
        if (!fromAccount.getCurrencyCode().equals(toAccount.getCurrencyCode())) {
            String currency = toAccount.getCurrencyCode();
            double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(fromAccount.getCurrencyCode(), currency)
                    .orElseThrow(() -> new IllegalArgumentException("Exchange rate not found"))
                    .getRate();
            finalAmount = amount * rate;
        } else {
            finalAmount = amount;
        }

        fromAccount.setBalance(fromAccount.getBalance() - amount);
        toAccount.setBalance(toAccount.getBalance() + finalAmount);
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
    }

    @Override
    public double getUserBalance(String userId) {
        Currency mainCurrency = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found")).getMainCurrency();
        List<Account> accounts = accountRepository.findAllByUserIdAndIncludeInStatsIsTrue(userId);
        return accounts.stream()
                .mapToDouble(account -> {
                    if (account.getCurrencyCode().equals(mainCurrency.getCode())) {
                        return account.getBalance();
                    } else {
                        double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(account.getCurrencyCode(), mainCurrency.getCode())
                                .orElseThrow(() -> new IllegalArgumentException("Exchange rate not found"))
                                .getRate();
                        return account.getBalance() * rate;
                    }
                })
                .sum();
    }

}
