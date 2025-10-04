package com.financemate.account.service;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.exception.AccessException;
import com.financemate.account.exception.AccountNotFoundException;
import com.financemate.account.exception.CurrencyNotFoundException;
import com.financemate.account.exception.IllegalOperationException;
import com.financemate.account.exception.UserNotFoundException;
import com.financemate.account.model.Account;
import com.financemate.account.model.Currency;
import com.financemate.account.repository.AccountRepository;
import com.financemate.account.repository.CurrencyRepository;
import com.financemate.account.repository.ExchangeRateRepository;
import com.financemate.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
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
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Account> accounts = accountRepository.findAllByUserId(userId);
        accounts.forEach(account -> account.setBalance(round(account.getBalance())));
        return accounts;
    }

    @Override
    public Account createAccount(AccountDto dto, String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new CurrencyNotFoundException("Currency not found"));

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
    @Transactional
    public Account updateAccount(String accountId, AccountDto dto, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }

        if (account.getBalance() != dto.balance()) {
            throw new IllegalOperationException("Balance cannot be changed directly");
        }

        if (!Objects.equals(account.getCurrencyCode(), dto.currencyCode())) {
            throw new IllegalOperationException("Currency cannot be changed");
        }
        account.setName(dto.name());
        account.setDescription(dto.description());
        account.setCurrencyCode(dto.currencyCode());
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public void deleteAccount(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        accountRepository.delete(account);
    }

    @Override
    public Account getAccountById(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        account.setBalance(round(account.getBalance()));
        return account;
    }

    @Override
    @Transactional
    public void archiveAccount(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        account.setArchived(!account.isArchived());
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void includeInStats(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        account.setIncludeInStats(!account.isIncludeInStats());
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public Account changeBalance(String accountId, double amount, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
        account.setBalance(round(account.getBalance()));
        return account;
    }

    @Override
    @Transactional
    public void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalOperationException("Cannot transfer to the same account");
        }
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow(()
                -> new AccountNotFoundException("Source account not found"));
        Account toAccount = accountRepository.findById(toAccountId).orElseThrow(()
                -> new AccountNotFoundException("Destination account not found"));

        if (!fromAccount.getUserId().equals(userId) || !toAccount.getUserId().equals(userId)) {
            throw new AccessException("One or both accounts do not belong to user");
        }

        if (fromAccount.getBalance() < amount) {
            throw new IllegalOperationException("Insufficient funds in source account");
        }

        double finalAmount;
        if (!fromAccount.getCurrencyCode().equals(toAccount.getCurrencyCode())) {
            String currency = toAccount.getCurrencyCode();
            double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(fromAccount.getCurrencyCode(), currency)
                    .orElseThrow(() -> new CurrencyNotFoundException("Exchange rate not found"))
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
                .orElseThrow(() -> new UserNotFoundException("User not found")).getMainCurrency();
        List<Account> accounts = accountRepository.findAllByUserIdAndIncludeInStatsIsTrue(userId);
        double result = accounts.stream()
                .mapToDouble(account -> {
                    if (account.getCurrencyCode().equals(mainCurrency.getCode())) {
                        return account.getBalance();
                    } else {
                        double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(account.getCurrencyCode(), mainCurrency.getCode())
                                .orElseThrow(() -> new CurrencyNotFoundException("Exchange rate not found"))
                                .getRate();
                        return account.getBalance() * rate;
                    }
                })
                .sum();
        return round(result);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

}
