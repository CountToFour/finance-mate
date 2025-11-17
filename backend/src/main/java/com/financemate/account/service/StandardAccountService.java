package com.financemate.account.service;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.dto.AccountResponse;
import com.financemate.account.dto.CurrencyResponse;
import com.financemate.account.exception.AccessException;
import com.financemate.account.exception.AccountNotFoundException;
import com.financemate.account.exception.CurrencyNotFoundException;
import com.financemate.account.exception.IllegalOperationException;
import com.financemate.account.model.Account;
import com.financemate.account.model.Currency;
import com.financemate.account.repository.AccountRepository;
import com.financemate.account.repository.CurrencyRepository;
import com.financemate.account.repository.ExchangeRateRepository;
import com.financemate.auth.model.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class StandardAccountService implements AccountService {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    public StandardAccountService(AccountRepository accountRepository,
                                  CurrencyRepository currencyRepository,
                                  ExchangeRateRepository exchangeRateRepository) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.currencyRepository = currencyRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public List<AccountResponse> getAccountForUser(User user) {
        List<Account> accounts = accountRepository.findAllByUserId(user);
        return accounts.stream().map(account -> new AccountResponse(
                account.getId(),
                account.getName(),
                account.getDescription(),
                round(account.getBalance()),
                account.getColor(),
                account.isIncludeInStats(),
                account.isArchived(),
                new CurrencyResponse(
                        account.getCurrencyCode().getCode(),
                        account.getCurrencyCode().getName(),
                        account.getCurrencyCode().getSymbol()
                )
        )).toList();
    }

    @Override
    @Transactional
    public AccountResponse createAccount(AccountDto dto, User user) {
        Currency currency = currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new CurrencyNotFoundException("Currency not found"));

        Account account = new Account();
        account.setName(dto.name());
        account.setDescription(dto.description());
        account.setCurrencyCode(currency);
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        account.setUserId(user);
        account.setIncludeInStats(true);
        account.setArchived(false);

        Account save = accountRepository.save(account);
        return new AccountResponse(
                save.getId(),
                save.getName(),
                save.getDescription(),
                save.getBalance(),
                save.getColor(),
                save.isIncludeInStats(),
                save.isArchived(),
                new CurrencyResponse(
                        save.getCurrencyCode().getCode(),
                        save.getCurrencyCode().getName(),
                        save.getCurrencyCode().getSymbol()
                )
        );
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(String accountId, AccountDto dto, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }

        if (account.getBalance() != dto.balance()) {
            throw new IllegalOperationException("Balance cannot be changed directly");
        }

        if (!Objects.equals(account.getCurrencyCode().getCode(), dto.currencyCode())) {
            throw new IllegalOperationException("Currency cannot be changed");
        }

        Currency currency = currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new CurrencyNotFoundException("Currency not found"));

        account.setName(dto.name());
        account.setDescription(dto.description());
        account.setCurrencyCode(currency);
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        Account save = accountRepository.save(account);

        return new AccountResponse(
                save.getId(),
                save.getName(),
                save.getDescription(),
                save.getBalance(),
                save.getColor(),
                save.isIncludeInStats(),
                save.isArchived(),
                new CurrencyResponse(
                        save.getCurrencyCode().getCode(),
                        save.getCurrencyCode().getName(),
                        save.getCurrencyCode().getSymbol()
                )
        );
    }

    @Override
    @Transactional
    public void deleteAccount(String accountId, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }
        accountRepository.delete(account);
    }

    @Override
    public AccountResponse getAccountById(String accountId, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }

        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getDescription(),
                round(account.getBalance()),
                account.getColor(),
                account.isIncludeInStats(),
                account.isArchived(),
                new CurrencyResponse(
                        account.getCurrencyCode().getCode(),
                        account.getCurrencyCode().getName(),
                        account.getCurrencyCode().getSymbol()
                )
        );
    }

    @Override
    @Transactional
    public void archiveAccount(String accountId, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }
        account.setArchived(!account.isArchived());
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void includeInStats(String accountId, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }
        account.setIncludeInStats(!account.isIncludeInStats());
        accountRepository.save(account);
    }

    @Override
    public void changeBalance(String accountId, double amount, User user) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().getId().equals(user.getId())) {
            throw new AccessException("Account does not belong to user");
        }
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, User user) {
        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalOperationException("Cannot transfer to the same account");
        }
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow(()
                -> new AccountNotFoundException("Source account not found"));
        Account toAccount = accountRepository.findById(toAccountId).orElseThrow(()
                -> new AccountNotFoundException("Destination account not found"));

        if (!fromAccount.getUserId().getId().equals(user.getId()) || !toAccount.getUserId().getId().equals(user.getId())) {
            throw new AccessException("One or both accounts do not belong to user");
        }

        if (fromAccount.getBalance() < amount) {
            throw new IllegalOperationException("Insufficient funds in source account");
        }

        double finalAmount;
        if (!fromAccount.getCurrencyCode().equals(toAccount.getCurrencyCode())) {
            Currency currencyCode = toAccount.getCurrencyCode();
            double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(fromAccount.getCurrencyCode().getCode(), currencyCode.getCode())
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
    public double getUserBalance(User user) {
        Currency mainCurrency = user.getMainCurrency();
        List<Account> accounts = accountRepository.findAllByUserIdAndIncludeInStatsIsTrue(user);
        double result = accounts.stream()
                .mapToDouble(account -> {
                    if (account.getCurrencyCode().getCode().equals(mainCurrency.getCode())) {
                        return account.getBalance();
                    } else {
                        double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(account.getCurrencyCode().getCode(), mainCurrency.getCode())
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
