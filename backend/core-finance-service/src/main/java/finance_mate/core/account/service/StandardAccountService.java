package finance_mate.core.account.service;

import finance_mate.core.account.exception.AccessException;
import finance_mate.core.account.exception.AccountNotFoundException;
import finance_mate.core.account.exception.CurrencyNotFoundException;
import finance_mate.core.account.exception.IllegalOperationException;
import finance_mate.core.account.model.Account;
import finance_mate.core.account.model.Currency;
import finance_mate.core.account.model.dto.AccountDto;
import finance_mate.core.account.model.dto.AccountResponse;
import finance_mate.core.account.model.dto.BalanceResponse;
import finance_mate.core.account.repository.AccountRepository;
import finance_mate.core.account.repository.CurrencyRepository;
import finance_mate.core.account.repository.ExchangeRateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
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
        Currency currency = currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new CurrencyNotFoundException("Currency not found"));

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
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }

        if (account.getBalance() != dto.balance()) {
            throw new IllegalOperationException("Balance cannot be changed directly");
        }

//        if (!Objects.equals(account.getCurrencyCode().getCode(), dto.currencyCode())) {
//            throw new IllegalOperationException("Currency cannot be changed");
//        }

        Currency currency = currencyRepository.findById(dto.currencyCode())
                .orElseThrow(() -> new CurrencyNotFoundException("Currency not found"));

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
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        accountRepository.delete(account);
    }

    @Override
    public AccountResponse getAccountById(String accountId, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }

        return mapAccountToDto(account);
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
    public void changeBalance(String accountId, double amount, String userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        if (!account.getUserId().equals(userId)) {
            throw new AccessException("Account does not belong to user");
        }
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public void transferBetweenAccounts(String fromAccountId, String toAccountId, double amount, String userId) {
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
}
