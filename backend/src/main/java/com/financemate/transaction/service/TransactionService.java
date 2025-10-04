package com.financemate.transaction.service;

import com.financemate.account.model.Account;
import com.financemate.account.repository.AccountRepository;
import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.UserRepository;
import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.TransactionDto;
import com.financemate.transaction.dto.TransactionOverviewDto;
import com.financemate.transaction.mapper.TransactionMapper;
import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.repository.TransactionRepository;
import com.financemate.transaction.repository.RecurringTransactionRepository;
import com.financemate.transaction.utils.TransactionSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    public Transaction addTransaction(TransactionDto dto) {
        //TODO SPRAWDŹ NA DEBUGERZE CZY USER I ACCOUNT SIE USTAWIAJĄ I CZY TRANSACTION TYPE PRAWIDLOWO SIE USTAWIA
        Transaction transaction = transactionMapper.transactionToEntity(dto);
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + dto.getUserId()));
        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found with id: " + dto.getAccountId()));
        if (transaction.getCreatedAt() == null) {
            transaction.setCreatedAt(LocalDate.now());
        }

        transaction.setUser(user);
        transaction.setAccount(account);

        return transactionRepository.save(transaction);
    }

    public void addRecurringTransaction(TransactionDto transactionDto) {
        if (transactionDto.getPeriodType() != PeriodType.NONE) {
            RecurringTransaction recurringTransaction = transactionMapper.recurringTransactionToEntity(transactionDto);
            recurringTransaction.setActive(true);

            if (recurringTransaction.getExpenseDate() != null && !recurringTransaction.getExpenseDate().isAfter(LocalDate.now())) {
                addTransaction(transactionDto);
                recurringTransaction.setExpenseDate(calculateNextDate(recurringTransaction.getExpenseDate(), recurringTransaction.getPeriodType()));
            }
            recurringTransactionRepository.save(recurringTransaction);
        } else {
            throw new IllegalArgumentException("Period type must be specified for recurring expenses.");
        }
    }

    public List<TransactionDto> getTransactionsByUser(String userId, String category, BigDecimal minPrice, BigDecimal maxPrice,
                                                      LocalDate startDate, LocalDate endDate, TransactionType type) {
        checkUserExists(userId);

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.hasCategory(category))
                .and(TransactionSpecifications.amountBetween(minPrice, maxPrice))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        return transactionRepository.findAll(spec).stream()
                .map(transactionMapper::transactionToDto)
                .toList();
    }

    public List<TransactionDto> getAllRecurringTransactions(String userId, TransactionType type) {
        checkUserExists(userId);

        return recurringTransactionRepository.findAllByUserIdAndType(userId, type).stream()
                .map(transactionMapper::recurringTransactionToDto)
                .toList();
    }

    public void deleteTransaction(String id) {
        //TODO SPRAWDZ NAJPIERW CZY ISTNIEJE I RZUĆ WYJĄTEK JEŚLI NIE
        transactionRepository.deleteById(id);
    }

    public void deleteRecurringTransaction(String id) {
        if (!recurringTransactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Recurring expense not found with id: " + id);
        }
        recurringTransactionRepository.deleteById(id);
    }

    public void deactivateRecurringTransaction(String id) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring expense not found with id: " + id));
        recurringTransaction.setActive(!recurringTransaction.isActive());
        recurringTransactionRepository.save(recurringTransaction);
    }

    public Transaction editTransaction(String id, TransactionDto transactionDto) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));

        if (transactionDto.getCategory() != null) {
            existingTransaction.setCategory(transactionDto.getCategory());
        }
        if (transactionDto.getPrice() != null) {
            existingTransaction.setPrice(transactionDto.getPrice());
        }
        if (transactionDto.getDescription() != null) {
            existingTransaction.setDescription(transactionDto.getDescription());
        }
        if (transactionDto.getExpenseDate() != null) {
            existingTransaction.setCreatedAt(transactionDto.getExpenseDate());
        }

        return transactionRepository.save(existingTransaction);
    }

    public RecurringTransaction editRecurringTransaction(String id, TransactionDto transactionDto) {
        RecurringTransaction existingRecurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurring expense not found with id: " + id));

        if (transactionDto.getCategory() != null) {
            existingRecurringTransaction.setCategory(transactionDto.getCategory());
        }
        if (transactionDto.getPrice() != null) {
            existingRecurringTransaction.setPrice(transactionDto.getPrice());
        }
        if (transactionDto.getDescription() != null) {
            existingRecurringTransaction.setDescription(transactionDto.getDescription());
        }
        if (transactionDto.getExpenseDate() != null) {
            existingRecurringTransaction.setExpenseDate(transactionDto.getExpenseDate());
        }
        if (transactionDto.getPeriodType() != null && transactionDto.getPeriodType() != PeriodType.NONE) {
            existingRecurringTransaction.setPeriodType(transactionDto.getPeriodType());
        }
        if (transactionDto.isActive() != existingRecurringTransaction.isActive()) {
            existingRecurringTransaction.setActive(transactionDto.isActive());
        }

        return recurringTransactionRepository.save(existingRecurringTransaction);
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
        double totalAmount = transactions.stream().map(Transaction::getPrice).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add).doubleValue();
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
                    BigDecimal totalAmount = transactionRepository.findAll(spec.and(TransactionSpecifications.hasCategory(category))).stream()
                            .map(Transaction::getPrice)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
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
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
    }
}
