package com.financemate.transaction.service;

import com.financemate.account.model.Account;
import com.financemate.account.repository.AccountRepository;
import com.financemate.account.service.AccountService;
import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.UserRepository;
import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.EditTransactionDto;
import com.financemate.transaction.dto.RecurringTransactionResponse;
import com.financemate.transaction.dto.TransactionRequest;
import com.financemate.transaction.dto.TransactionOverviewDto;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.exception.AccountNotFoundException;
import com.financemate.transaction.exception.InvalidPeriodTypeException;
import com.financemate.transaction.exception.TransactionNotFoundException;
import com.financemate.transaction.exception.UserNotFoundException;
import com.financemate.transaction.mapper.TransactionMapper;
import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.repository.TransactionRepository;
import com.financemate.transaction.repository.RecurringTransactionRepository;
import com.financemate.transaction.utils.TransactionSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionMapper transactionMapper;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;

    @Transactional
    public TransactionResponse addTransaction(TransactionRequest dto) {
        Transaction transaction = transactionMapper.transactionToEntity(dto);
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + dto.getUserId()));
        Account account = accountRepository.findByIdAndUserId(dto.getAccountId(), dto.getUserId())
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + dto.getAccountId()));
        if (transaction.getCreatedAt() == null) {
            transaction.setCreatedAt(LocalDate.now());
        }
        if (transaction.getTransactionType() == TransactionType.EXPENSE) {
            transaction.setPrice(-Math.abs(transaction.getPrice()));
        } else {
            transaction.setPrice(Math.abs(transaction.getPrice()));
        }

        transaction.setUser(user);
        transaction.setAccount(account);

        transactionRepository.save(transaction);
        accountService.changeBalance(account.getId(), transaction.getPrice(), user.getId());
        TransactionResponse savedDto = transactionMapper.transactionToDto(transaction);
        savedDto.setAccountName(account.getName());
        return savedDto;
    }

    @Transactional
    public RecurringTransactionResponse addRecurringTransaction(TransactionRequest transactionRequest) {
        if (transactionRequest.getPeriodType() != PeriodType.NONE) {
            User user = userRepository.findById(transactionRequest.getUserId())
                    .orElseThrow(() -> new UserNotFoundException("User not found with id: " + transactionRequest.getUserId()));
            Account account = accountRepository.findByIdAndUserId(transactionRequest.getAccountId(), transactionRequest.getUserId())
                    .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + transactionRequest.getAccountId()));

            RecurringTransaction recurringTransaction = transactionMapper.recurringTransactionToEntity(transactionRequest);
            recurringTransaction.setActive(true);

            if (recurringTransaction.getTransactionType() == TransactionType.EXPENSE) {
                recurringTransaction.setPrice(-Math.abs(recurringTransaction.getPrice()));
            } else {
                recurringTransaction.setPrice(Math.abs(recurringTransaction.getPrice()));
            }

            if (recurringTransaction.getCreatedAt() != null && !recurringTransaction.getCreatedAt().isAfter(LocalDate.now())) {
                addTransaction(transactionRequest);
                recurringTransaction.setCreatedAt(calculateNextDate(recurringTransaction.getCreatedAt(), recurringTransaction.getPeriodType()));
            }

            recurringTransaction.setAccount(account);
            recurringTransaction.setUser(user);
            recurringTransactionRepository.save(recurringTransaction);
            RecurringTransactionResponse savedDto = transactionMapper.recurringTransactionToDto(recurringTransaction);
            savedDto.setAccountName(account.getName());
            return savedDto;
        } else {
            throw new InvalidPeriodTypeException("Period type must be specified for recurring expenses.");
        }
    }

    public List<TransactionResponse> getTransactionsByUser(String userId, String category, Double minPrice, Double maxPrice,
                                                           LocalDate startDate, LocalDate endDate, TransactionType type,
                                                           String accountName) throws UserNotFoundException {
        checkUserExists(userId);

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.hasCategory(category))
                .and(TransactionSpecifications.amountBetween(minPrice, maxPrice))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type))
                .and(TransactionSpecifications.accountName(accountName));

        return transactionRepository.findAll(spec).stream()
                .map(transaction -> {
                    TransactionResponse dto = transactionMapper.transactionToDto(transaction);
                    dto.setAccountName(transaction.getAccount().getName());
                    return dto;
                })
                .toList();
    }

    public List<RecurringTransactionResponse> getAllRecurringTransactions(String userId, TransactionType type)
            throws UserNotFoundException {
        checkUserExists(userId);

        return recurringTransactionRepository.findAllByUserIdAndTransactionType(userId, type).stream()
                .map(transaction -> {
                    RecurringTransactionResponse dto = transactionMapper.recurringTransactionToDto(transaction);
                    dto.setAccountName(transaction.getAccount().getName());
                    return dto;
                })
                .toList();
    }

    @Transactional
    public void deleteTransaction(String id) {
        transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with id: " + id));
        transactionRepository.deleteById(id);
    }

    @Transactional
    public void deleteRecurringTransaction(String id) {
        if (!recurringTransactionRepository.existsById(id)) {
            throw new TransactionNotFoundException("Recurring transaction not found with id: " + id);
        }
        recurringTransactionRepository.deleteById(id);
    }

    @Transactional
    public void deactivateRecurringTransaction(String id) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Recurring transaction not found with id: " + id));
        recurringTransaction.setActive(!recurringTransaction.isActive());
        recurringTransactionRepository.save(recurringTransaction);
    }

    @Transactional
    public TransactionResponse editTransaction(String id, EditTransactionDto dto) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with id: " + id));

        if (Objects.nonNull(dto.category()) && !dto.category().equals(existingTransaction.getCategory())) {
            existingTransaction.setCategory(dto.category());
        }
        if (Objects.nonNull(dto.price()) && dto.price() != Math.abs(existingTransaction.getPrice())) {
            double change;
            if (existingTransaction.getTransactionType() == TransactionType.EXPENSE) {
                change = -Math.abs(dto.price()) - existingTransaction.getPrice();
                existingTransaction.setPrice(-Math.abs(dto.price()));
                System.out.println("Setting expense price: " + existingTransaction.getPrice());
            } else {
                existingTransaction.setPrice(Math.abs(dto.price()));
                change = Math.abs(dto.price()) - existingTransaction.getPrice();
            }
            accountService.changeBalance(existingTransaction.getAccount().getId(), change, existingTransaction.getUser().getId());
        }
        if (dto.description() != null && !dto.description().equals(existingTransaction.getDescription())) {
            existingTransaction.setDescription(dto.description());
        }
        if (dto.createdAt() != null && !dto.createdAt().equals(existingTransaction.getCreatedAt())) {
            existingTransaction.setCreatedAt(dto.createdAt());
        }
        transactionRepository.save(existingTransaction);
        return transactionMapper.transactionToDto(existingTransaction);
    }

    @Transactional
    public RecurringTransactionResponse editRecurringTransaction(String id, EditTransactionDto dto) {
        RecurringTransaction transaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found with id: " + id));

        if (Objects.nonNull(dto.category()) && !dto.category().equals(transaction.getCategory())) {
            transaction.setCategory(dto.category());
        }
        if (Objects.nonNull(dto.price()) && dto.price() != Math.abs(transaction.getPrice())) {
            transaction.setPrice(dto.price());
        }
        if (dto.description() != null && !dto.description().equals(transaction.getDescription())) {
            transaction.setDescription(dto.description());
        }
        if (dto.createdAt() != null && !dto.createdAt().equals(transaction.getCreatedAt())) {
            transaction.setCreatedAt(dto.createdAt());
        }
        if (dto.periodType() != PeriodType.NONE && dto.periodType() != transaction.getPeriodType()) {
            transaction.setPeriodType(dto.periodType());
        }
        if (dto.accountId() != null && !dto.accountId().equals(transaction.getAccount().getId())) {
            Account account = accountRepository.findByIdAndUserId(dto.accountId(), transaction.getUser().getId())
                    .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + dto.accountId()));
            transaction.setAccount(account);
        }
        recurringTransactionRepository.save(transaction);
        return transactionMapper.recurringTransactionToDto(transaction);
    }

    public TransactionOverviewDto getTransactionOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        checkUserExists(userId);

        List<Object> actualTotalOverview = getMonthlyTransactionOverview(userId, startDate, endDate, type);
        List<Object> previousTotalOverview = getMonthlyTransactionOverview(userId, startDate.minusMonths(1), endDate.minusMonths(1), type);

        double totalAmountChangePercentage = ((double) actualTotalOverview.get(0) / (double) previousTotalOverview.get(0)) * 100;
        totalAmountChangePercentage = Math.round(totalAmountChangePercentage * 10.0) / 10.0 - 100;
        int expenseCountChangePercentage = (int) actualTotalOverview.get(2) - (int) previousTotalOverview.get(2);

        return new TransactionOverviewDto(
                Math.round((double) actualTotalOverview.get(0) * 100.0) / 100.0,
                Math.round((double) actualTotalOverview.get(1) * 100.0) / 100.0,
                (int) actualTotalOverview.get(2),
                totalAmountChangePercentage,
                expenseCountChangePercentage
        );
    }

    private List<Object> getMonthlyTransactionOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        List<Transaction> transactions = transactionRepository.findAll(spec);
        double totalAmount = transactions.stream().map(Transaction::getPrice)
                .mapToDouble(Double::doubleValue).sum();
        double averageAmount = totalAmount / 30;
        int expensesCount = transactions.size();

        return List.of(totalAmount, averageAmount, expensesCount);
    }

    public List<CategoryDto> getAllCategoriesAmount(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        checkUserExists(userId);

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        Set<String> categories = transactionRepository.findAll(spec).stream()
                .map(Transaction::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return categories.stream()
                .map(category -> {
                    int transactions = transactionRepository.findAll(spec.and(TransactionSpecifications.hasCategory(category))).size();
                    double percentage = transactions / (double) transactionRepository.findAll(spec).size();
                    double totalAmount = transactionRepository.findAll(spec.and(TransactionSpecifications.hasCategory(category))).stream()
                            .map(Transaction::getPrice)
                            .mapToDouble(Double::doubleValue).sum();
                    return new CategoryDto(category, totalAmount, transactions, percentage);
                })
                .toList();
    }

    private LocalDate calculateNextDate(LocalDate baseDate, PeriodType type) {
        return switch (type) {
            case DAILY -> baseDate.plusDays(1);
            case WEEKLY -> baseDate.plusWeeks(1);
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY -> baseDate.plusYears(1);
            default -> baseDate;
        };
    }

    private void checkUserExists(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
    }
}
