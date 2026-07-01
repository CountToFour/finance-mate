package finance_mate.core.account.service;

import finance_mate.core.account.model.Account;
import finance_mate.core.account.model.Currency;
import finance_mate.core.account.model.dto.AccountDto;
import finance_mate.core.account.model.dto.AccountResponse;
import finance_mate.core.account.model.dto.BalanceResponse;
import finance_mate.core.account.repository.AccountRepository;
import finance_mate.core.account.repository.CurrencyRepository;
import finance_mate.core.account.repository.ExchangeRateRepository;
import finance_mate.core.exception.AccountException;
import finance_mate.core.exception.CurrencyException;
import finance_mate.core.exception.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class StandardAccountService implements AccountService {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    @Override
    public List<AccountResponse> getAccountForUser(String userId) {
        List<Account> accounts = accountRepository.findAllByUserId(userId);
        return accounts.stream().map(this::mapAccountToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccountResponse createAccount(AccountDto dto, String userId) {
//        Currency currency = currencyRepository.findById(dto.currencyCode())
//                .orElseThrow(() -> {
//                    log.error("Currency {} not found", dto.currencyCode());
//                    return new CurrencyException(ErrorCode.CURRENCY_NOT_FOUND);
//                });

        Account account = new Account();
        account.setName(dto.name());
        account.setDescription(dto.description());
//        account.setCurrencyCode(currency);
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        account.setUserId(userId);
        account.setIncludeInStats(true);
        account.setArchived(false);

        return mapAccountToDto(accountRepository.save(account));
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(String accountId, AccountDto dto, String userId) {
        Account account = getAccount(accountId, userId);

        if (account.getBalance() != dto.balance()) {
            log.error("Account balance cannot be changed in update action, account id: {}", account);
            throw new AccountException(ErrorCode.ACCOUNT_BALANCE_UPDATE);
        }

//        if (!Objects.equals(account.getCurrencyCode().getCode(), dto.currencyCode())) {
//            throw new IllegalOperationException("Currency cannot be changed");
//        }

//        Currency currency = currencyRepository.findById(dto.currencyCode())
//                .orElseThrow(() -> {
//                    log.error("Currency {} not found", dto.currencyCode());
//                    return new CurrencyException(ErrorCode.CURRENCY_NOT_FOUND);
//                });

        account.setName(dto.name());
        account.setDescription(dto.description());
//        account.setCurrencyCode(currency);
        account.setBalance(dto.balance());
        account.setColor(dto.color());
        Account save = accountRepository.save(account);

        return mapAccountToDto(save);
    }

    @Override
    @Transactional
    public void deleteAccount(String accountId, String userId) {
        //TODO TRANSACTIONS ALSO NEED TO BE DELETED AFTER THAT
        Account account = getAccount(accountId, userId);
        accountRepository.delete(account);
    }

    @Override
    public AccountResponse getAccountById(String accountId, String userId) {
        Account account = getAccount(accountId, userId);

        return mapAccountToDto(account);
    }

    @Override
    @Transactional
    public void archiveAccount(String accountId, String userId) {
        Account account = getAccount(accountId, userId);
        account.setArchived(!account.isArchived());
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void includeInStats(String accountId, String userId) {
        Account account = getAccount(accountId, userId);
        account.setIncludeInStats(!account.isIncludeInStats());
        accountRepository.save(account);
    }

    @Override
    public void changeBalance(String accountId, double amount, String userId) {
        Account account = getAccount(accountId, userId);
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId) {
        if (fromAccountId.equals(toAccountId)) {
            log.error("Money cannot be transfer to the same account, id: {}", fromAccountId);
            throw new AccountException(ErrorCode.ACCOUNT_TRANSFER);
        }
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow(() -> {
            log.error("Source account not found");
            return new AccountException(ErrorCode.ACCOUNT_NOT_FOUND);
        });
        Account toAccount = accountRepository.findById(toAccountId).orElseThrow(() -> {
            log.error("Destination account not found");
            return new AccountException(ErrorCode.ACCOUNT_NOT_FOUND);
        });

        if (!fromAccount.getUserId().equals(userId) || !toAccount.getUserId().equals(userId)) {
            log.error("Account with id: {} or with id: {} doesn't belong to user with id: {}", fromAccount, toAccountId, userId);
            throw new AccountException(ErrorCode.ACCOUNT_ACCESS_DENIED);
        }

        if (fromAccount.getBalance() < amount) {
            log.error("Insufficient funds in source account {}", fromAccountId);
            throw new AccountException(ErrorCode.ACCOUNT_NOT_ENOUGH_MONEY);
        }

        double finalAmount = amount;
//        if (!fromAccount.getCurrencyCode().equals(toAccount.getCurrencyCode())) {
//            Currency currencyCode = toAccount.getCurrencyCode();
//            double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(fromAccount.getCurrencyCode().getCode(), currencyCode.getCode())
//                    .orElseThrow(() -> new CurrencyNotFoundException("Exchange rate not found"))
//                    .getRate();
//            finalAmount = amount * rate;
//        } else {
//            finalAmount = amount;
//        }

        fromAccount.setBalance(fromAccount.getBalance() - amount);
        toAccount.setBalance(toAccount.getBalance() + finalAmount);
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
    }

    @Override
    public BalanceResponse getUserBalance(String userId) {
//        Currency mainCurrency = user.getMainCurrency();
        List<Account> accounts = accountRepository.findAllByUserIdAndIncludeInStatsIsTrue(userId);
        double result = accounts.stream().mapToDouble(Account::getBalance).sum();
//        double result = accounts.stream()
//                .mapToDouble(account -> {
//                    if (account.getCurrencyCode().getCode().equals(mainCurrency.getCode())) {
//                        return account.getBalance();
//                    } else {
//                        double rate = exchangeRateRepository.findByFromCurrencyAndToCurrency(account.getCurrencyCode().getCode(), mainCurrency.getCode())
//                                .orElseThrow(() -> new CurrencyNotFoundException("Exchange rate not found"))
//                                .getRate();
//                        return account.getBalance() * rate;
//                    }
//                })
//                .sum();
//        return new BalanceResponse(round(result), mainCurrency.getSymbol());
        return new BalanceResponse(round(result), "zł");
    }

    @Override
    public Optional<Account> findByIdAndUserId(String id, String userId) {
        return accountRepository.findByIdAndUserId(id, userId);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private AccountResponse mapAccountToDto(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .balance(account.getBalance())
                .description(account.getDescription())
                .color(account.getColor())
                .includeInStats(account.isIncludeInStats())
                .archived(account.isArchived())
                .build();
    }

    private Account getAccount(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> {
            log.error("Account with id {} not found", accountId);
            return new AccountException(ErrorCode.ACCOUNT_NOT_FOUND);
        });
        if (!account.getUserId().equals(userId)) {
            log.error("Account with id: {} doesn't belong to user with id: {}", accountId, userId);
            throw new AccountException(ErrorCode.ACCOUNT_ACCESS_DENIED);
        }

        return account;
    }
}
