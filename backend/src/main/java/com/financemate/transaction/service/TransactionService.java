package com.financemate.transaction.service;

import com.financemate.account.model.Account;
import com.financemate.account.repository.AccountRepository;
import com.financemate.account.service.AccountService;
import com.financemate.auth.model.user.User;
import com.financemate.budget.service.BudgetService;
import com.financemate.category.model.Category;
import com.financemate.category.repository.CategoryRepository;
import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.EditTransactionDto;
import com.financemate.transaction.dto.MonthOverviewDto;
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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionMapper transactionMapper;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;

    @Transactional
    public TransactionResponse addTransaction(TransactionRequest dto, User user) {
        Transaction transaction = transactionMapper.transactionToEntity(dto);
        Account account = accountRepository.findByIdAndUserId(dto.getAccountId(), user)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + dto.getAccountId()));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.getCategoryId()));

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
        transaction.setCategory(category.getName());

        budgetService.updateSpentAmount(category, Math.abs(transaction.getPrice()));

        transactionRepository.save(transaction);
        accountService.changeBalance(account.getId(), transaction.getPrice(), user);
        TransactionResponse savedDto = transactionMapper.transactionToDto(transaction);
        savedDto.setAccountName(account.getName());
        return savedDto;
    }

    @Transactional
    public RecurringTransactionResponse addRecurringTransaction(TransactionRequest dto, User user) {
        if (dto.getPeriodType() != PeriodType.NONE) {
            Account account = accountRepository.findByIdAndUserId(dto.getAccountId(), user)
                    .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + dto.getAccountId()));
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.getCategoryId()));

            RecurringTransaction recurringTransaction = transactionMapper.recurringTransactionToEntity(dto);
            recurringTransaction.setActive(true);

            if (recurringTransaction.getTransactionType() == TransactionType.EXPENSE) {
                recurringTransaction.setPrice(-Math.abs(recurringTransaction.getPrice()));
            } else {
                recurringTransaction.setPrice(Math.abs(recurringTransaction.getPrice()));
            }

            if (recurringTransaction.getCreatedAt() != null && !recurringTransaction.getCreatedAt().isAfter(LocalDate.now())) {
                addTransaction(dto, user);
                recurringTransaction.setCreatedAt(calculateNextDate(recurringTransaction.getCreatedAt(), recurringTransaction.getPeriodType()));
            }

            recurringTransaction.setAccount(account);
            recurringTransaction.setUser(user);
            recurringTransaction.setCategory(category.getName());
            recurringTransactionRepository.save(recurringTransaction);
            RecurringTransactionResponse savedDto = transactionMapper.recurringTransactionToDto(recurringTransaction);
            savedDto.setAccountName(account.getName());
            return savedDto;
        } else {
            throw new InvalidPeriodTypeException("Period type must be specified for recurring expenses.");
        }
    }

    public List<TransactionResponse> getTransactionsByUser(User user, String category, Double minPrice, Double maxPrice,
                                                           LocalDate startDate, LocalDate endDate, TransactionType type,
                                                           String accountName) throws UserNotFoundException {

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(user.getId()))
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

    public List<RecurringTransactionResponse> getAllRecurringTransactions(User user, TransactionType type)
            throws UserNotFoundException {

        return recurringTransactionRepository.findAllByUserIdAndTransactionType(user.getId(), type).stream()
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

        if (Objects.nonNull(dto.categoryId())) {
            Category category = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.categoryId()));
            if (!category.getName().equals(existingTransaction.getCategory())) {
                existingTransaction.setCategory(category.getName());
            }
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
            accountService.changeBalance(existingTransaction.getAccount().getId(), change, existingTransaction.getUser());
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

        if (Objects.nonNull(dto.categoryId())) {
            Category category = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.categoryId()));
            if (!category.getName().equals(transaction.getCategory())) {
                transaction.setCategory(category.getName());
            }
        }
        if (Objects.nonNull(dto.price()) && dto.price() != Math.abs(transaction.getPrice())) {
            if (transaction.getTransactionType() == TransactionType.EXPENSE) {
                transaction.setPrice(-Math.abs(dto.price()));
                System.out.println("Setting expense price: " + transaction.getPrice());
            } else {
                transaction.setPrice(Math.abs(dto.price()));
            }
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
            Account account = accountRepository.findByIdAndUserId(dto.accountId(), transaction.getUser())
                    .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + dto.accountId()));
            transaction.setAccount(account);
        }
        recurringTransactionRepository.save(transaction);
        return transactionMapper.recurringTransactionToDto(transaction);
    }

    public TransactionOverviewDto getTransactionOverview(User user, LocalDate startDate, LocalDate endDate, TransactionType type) {

        // jeśli daty nie są przekazane, licz na podstawie ostatnich 30 dni
        boolean useLast30Days = (startDate == null || endDate == null);
        LocalDate currentStart;
        LocalDate currentEnd;
        LocalDate previousStart;
        LocalDate previousEnd;

        if (useLast30Days) {
            currentEnd = LocalDate.now();
            currentStart = currentEnd.minusDays(29); // ostatnie 30 dni łącznie
            previousEnd = currentStart.minusDays(1);
            previousStart = previousEnd.minusDays(29);
        } else {
            currentStart = startDate;
            currentEnd = endDate;
            previousStart = currentStart.minusMonths(1);
            previousEnd = currentEnd.minusMonths(1);
        }

        List<Object> actualTotalOverview = getMonthlyTransactionOverview(user, currentStart, currentEnd, type);
        List<Object> previousTotalOverview = getMonthlyTransactionOverview(user, previousStart, previousEnd, type);

        double actualTotal = (double) actualTotalOverview.get(0);
        double previousTotal = (double) previousTotalOverview.get(0);

        double totalAmountChangePercentage;
        if (previousTotal == 0) {
            totalAmountChangePercentage = actualTotal == 0 ? 0.0 : 100.0; // jeśli poprzedni okres miał 0, ustaw pragmatycznie 100% wzrostu
        } else {
            totalAmountChangePercentage = ((actualTotal - previousTotal) / previousTotal) * 100.0;
        }
        // zaokrąglenie do 1 miejsca po przecinku
        totalAmountChangePercentage = Math.round(totalAmountChangePercentage * 10.0) / 10.0;

        int expenseCountChange = (int) actualTotalOverview.get(2) - (int) previousTotalOverview.get(2);

        double totalRounded = Math.round(actualTotal * 100.0) / 100.0;
        double averageRounded = Math.round(((double) actualTotalOverview.get(1)) * 100.0) / 100.0;

        return new TransactionOverviewDto(
                totalRounded,
                averageRounded,
                (int) actualTotalOverview.get(2),
                totalAmountChangePercentage,
                expenseCountChange
        );
    }

    private List<Object> getMonthlyTransactionOverview(User user, LocalDate startDate, LocalDate endDate, TransactionType type) {
        // zabezpieczenie: jeśli startDate > endDate, zamień je
        if (startDate.isAfter(endDate)) {
            LocalDate tmp = startDate;
            startDate = endDate;
            endDate = tmp;
        }

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(user.getId()))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        List<Transaction> transactions = transactionRepository.findAll(spec);
        double totalAmount = transactions.stream().map(Transaction::getPrice)
                .mapToDouble(Double::doubleValue).sum();

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1; // liczba dni w okresie (włącznie)
        if (days <= 0) days = 1;

        int expensesCount = transactions.size();
        double averageAmount = totalAmount / expensesCount;

        return List.of(totalAmount, averageAmount, expensesCount);
    }

    public List<CategoryDto> getAllCategoriesAmount(User user, LocalDate startDate, LocalDate endDate, TransactionType type) {

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(user.getId()))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        List<Transaction> transactions = transactionRepository.findAll(spec);

        double totalSum = transactions.stream()
                .map(Transaction::getPrice)
                .mapToDouble(Double::doubleValue)
                .map(Math::abs)
                .sum();

        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(Transaction::getCategory));

        return grouped.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<Transaction> txs = entry.getValue();
                    int transactionsCount = txs.size();
                    double categorySum = txs.stream()
                            .map(Transaction::getPrice)
                            .mapToDouble(Double::doubleValue)
                            .map(Math::abs)
                            .sum();
                    double percentage = totalSum == 0.0 ? 0.0 : (categorySum / totalSum);
                    return new CategoryDto(category, categorySum, transactionsCount, percentage);
                })
                .toList();
    }

    public List<MonthOverviewDto> getMonthlyOverview(User user, LocalDate startDate, LocalDate endDate) {
        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(user.getId()))
                .and(TransactionSpecifications.dateBetween(startDate, endDate));

        List<Transaction> transactions = transactionRepository.findAll(spec);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<java.time.YearMonth, List<Transaction>> groupedByMonth = transactions.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(t -> java.time.YearMonth.of(t.getCreatedAt().getYear(), t.getCreatedAt().getMonthValue())));

        return groupedByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    java.time.YearMonth ym = entry.getKey();
                    String month = ym.format(formatter);
                    List<Transaction> txs = entry.getValue();

                    double totalIncome = txs.stream()
                            .map(Transaction::getPrice)
                            .mapToDouble(Double::doubleValue)
                            .filter(price -> price > 0)
                            .sum();

                    double totalExpense = txs.stream()
                            .map(Transaction::getPrice)
                            .mapToDouble(Double::doubleValue)
                            .filter(price -> price < 0)
                            .map(Math::abs)
                            .sum();

                    return new MonthOverviewDto(month, totalIncome, totalExpense);
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


    //TODO COS SIE STANIE JAK BEDZIE MNIEJ REKORDOW NIZ LIMIT
    public List<TransactionResponse> getTopTransactionsByAmount(User user, LocalDate startDate, LocalDate endDate, int limit, TransactionType type) throws UserNotFoundException {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        if (limit <= 0) {
            return List.of();
        }

        List<TransactionResponse> all = getTransactionsByUser(user, null, null, null, startDate, endDate, type, null);

        return all.stream()
                .sorted((t1, t2) -> Double.compare(Math.abs(t2.getPrice()), Math.abs(t1.getPrice())))
                .limit(limit)
                .toList();
    }
}
