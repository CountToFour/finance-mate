package finance_mate.core.transaction.service;

import finance_mate.core.account.model.Account;
import finance_mate.core.account.service.AccountService;
import finance_mate.core.category.model.Category;
import finance_mate.core.category.model.CategoryGroup;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.exception.AccountException;
import finance_mate.core.exception.CategoryException;
import finance_mate.core.exception.ErrorCode;
import finance_mate.core.exception.TransactionException;
import finance_mate.core.rabbit.publish.CoreRabbitMQPublisher;
import finance_mate.core.transaction.mapper.TransactionMapper;
import finance_mate.core.transaction.model.PeriodType;
import finance_mate.core.transaction.model.Transaction;
import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.*;
import finance_mate.core.transaction.repository.RecurringTransactionRepository;
import finance_mate.core.transaction.repository.TransactionRepository;
import finance_mate.core.transaction.utils.TransactionSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandardTransactionService implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final CoreRabbitMQPublisher publisher;

    @Transactional
    @Override
    public TransactionResponse addTransaction(TransactionRequest dto, String userId) {
        Transaction transaction = transactionMapper.transactionToEntity(dto);
        Account account = accountService.findByIdAndUserId(dto.getAccountId(), userId)
                .orElseThrow(() -> new AccountException(ErrorCode.ACCOUNT_NOT_FOUND));
        Category category = categoryService.findById(dto.getCategoryId())
                .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));

        if (category.getTransactionType() != transaction.getTransactionType()) {
            throw new TransactionException(ErrorCode.TRANSACTION_CATEGORY_TYPE_MISMATCH);
        }

        if (transaction.getCreatedAt() == null) {
            transaction.setCreatedAt(LocalDate.now());
        }
        if (transaction.getTransactionType() == TransactionType.EXPENSE) {
            transaction.setPrice(-Math.abs(transaction.getPrice()));
        } else {
            transaction.setPrice(Math.abs(transaction.getPrice()));
        }

        transaction.setUserId(userId);
        transaction.setAccount(account);
        transaction.setCategory(category);

        if (TransactionType.EXPENSE.equals(transaction.getTransactionType())) {
            publisher.updateBudget(new BudgetProgressDto(category.getId(), Math.abs(transaction.getPrice())));
        }

        transactionRepository.save(transaction);
        accountService.changeBalance(account.getId(), transaction.getPrice(), userId);
        TransactionResponse savedDto = transactionMapper.transactionToDto(transaction);
        savedDto.setAccountName(account.getName());
        savedDto.setCategoryName(category.getName());
        return savedDto;
    }

    @Override
    public List<TransactionResponse> getTransactionsByUser(String userId, String category, Double minPrice, Double maxPrice,
                                                           LocalDate startDate, LocalDate endDate, TransactionType type,
                                                           String accountName) {

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
                    dto.setCategoryName(transaction.getCategory().getName());
                    return dto;
                })
                .toList();
    }

    @Transactional
    @Override
    public void deleteTransaction(String id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionException(ErrorCode.TRANSACTION_NOT_FOUND));
        if (TransactionType.EXPENSE.equals(transaction.getTransactionType())) {
            accountService.changeBalance(transaction.getAccount().getId(), Math.abs(transaction.getPrice()), transaction.getUserId());
        } else {
            accountService.changeBalance(transaction.getAccount().getId(), -Math.abs(transaction.getPrice()), transaction.getUserId());
        }
        transactionRepository.deleteById(id);

    }

    @Transactional
    @Override
    public TransactionResponse editTransaction(String id, EditTransactionDto dto) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionException(ErrorCode.TRANSACTION_NOT_FOUND));

        if (Objects.nonNull(dto.categoryId())) {
            Category category = categoryService.findById(dto.categoryId())
                    .orElseThrow(() -> new CategoryException(ErrorCode.CATEGORY_NOT_FOUND));
            if (!category.getTransactionType().equals(existingTransaction.getTransactionType())) {
                throw new TransactionException(ErrorCode.TRANSACTION_CATEGORY_TYPE_MISMATCH);
            }
            if (!category.getName().equals(existingTransaction.getCategory().getName())) {
                existingTransaction.setCategory(category);
            }
        }
        if (Objects.nonNull(dto.price()) && dto.price() != Math.abs(existingTransaction.getPrice())) {
            double change;
            if (existingTransaction.getTransactionType() == TransactionType.EXPENSE) {
                change = -Math.abs(dto.price()) - existingTransaction.getPrice();
                existingTransaction.setPrice(-Math.abs(dto.price()));
                publisher.updateBudget(new BudgetProgressDto(existingTransaction.getCategory().getId(), change));
            } else {
                existingTransaction.setPrice(Math.abs(dto.price()));
                change = Math.abs(dto.price()) - existingTransaction.getPrice();
            }
            accountService.changeBalance(existingTransaction.getAccount().getId(), change, existingTransaction.getUserId());
        }
        if (dto.description() != null && !dto.description().equals(existingTransaction.getDescription())) {
            existingTransaction.setDescription(dto.description());
        }
        if (dto.createdAt() != null && !dto.createdAt().equals(existingTransaction.getCreatedAt())) {
            existingTransaction.setCreatedAt(dto.createdAt());
        }
        transactionRepository.save(existingTransaction);
        TransactionResponse transactionResponse = transactionMapper.transactionToDto(existingTransaction);
        transactionResponse.setAccountName(existingTransaction.getAccount().getName());
        transactionResponse.setCategoryName(existingTransaction.getCategory().getName());
        return transactionResponse;
    }

    @Override
    public TransactionOverviewDto getTransactionOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        boolean useDefaultDate = startDate == null && endDate == null;

        LocalDate start;
        LocalDate middle;
        LocalDate end;

        if (useDefaultDate) {
            end = LocalDate.now();
            middle = end.minusDays(30);
            start = end.minusDays(60);
        } else {
            end = endDate;
            middle = startDate;
            start = middle.minusDays(ChronoUnit.DAYS.between(end, middle));
        }

        Double totalValue = transactionRepository.calculateSum(middle, end);
        totalValue = totalValue == null ? 0 : totalValue;
        Double previousValue = transactionRepository.calculateSum(start, middle);
        previousValue = previousValue == null ? 0 : previousValue;

        int totalAmount = transactionRepository.getCount(middle, end);
        int previousAmount = transactionRepository.getCount(start, middle);

        double totalValueChange = 0;
        if (previousValue != 0) {
            totalValueChange = (totalValue / previousValue - 1) * 100;
        } else if (totalValue > 0) {
            totalValueChange = 100;
        } else if (totalValue < 0) {
            totalValueChange = -100;
        }

        double totalAmountChange = 0;
        if (previousAmount != 0) {
            totalAmountChange = ((double) totalAmount / previousAmount - 1) * 100;
        } else if (totalAmount > 0) {
            totalAmountChange = 100;
        }

        double average = totalValue / 30;
        return new TransactionOverviewDto(
                totalValue,
                totalAmount,
                totalValueChange,
                totalAmountChange,
                average
        );
    }

    private List<Object> getMonthlyTransactionOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        if (startDate.isAfter(endDate)) {
            LocalDate tmp = startDate;
            startDate = endDate;
            endDate = tmp;
        }

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        List<Transaction> transactions = transactionRepository.findAll(spec);
        double totalAmount = transactions.stream()
                .mapToDouble(t -> getConvertedAmount(t, userId))
                .sum();

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days <= 0) days = 1;

        int expensesCount = transactions.size();
        double averageAmount = totalAmount / expensesCount;

        return List.of(totalAmount, averageAmount, expensesCount);
    }

    @Override
    public List<CategoryDto> getAllCategoriesAmount(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {

        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.dateBetween(startDate, endDate))
                .and(TransactionSpecifications.type(type));

        List<Transaction> transactions = transactionRepository.findAll(spec);

        double totalSum = transactions.stream()
                .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                .sum();

        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getName()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<Transaction> txs = entry.getValue();
                    int transactionsCount = txs.size();
                    double categorySum = txs.stream()
                            .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                            .sum();
                    double percentage = totalSum == 0.0 ? 0.0 : (categorySum / totalSum);
                    return new CategoryDto(category, categorySum, transactionsCount, percentage);
                })
                .toList();
    }

    @Override
    public List<MonthOverviewDto> getMonthlyOverview(String userId, LocalDate startDate, LocalDate endDate) {
        Specification<Transaction> spec = Specification.allOf(TransactionSpecifications.hasUserId(userId))
                .and(TransactionSpecifications.dateBetween(startDate, endDate));

        List<Transaction> transactions = transactionRepository.findAll(spec);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<YearMonth, List<Transaction>> groupedByMonth = transactions.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(t -> YearMonth.of(t.getCreatedAt().getYear(), t.getCreatedAt().getMonthValue())));

        return groupedByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    YearMonth ym = entry.getKey();
                    String month = ym.format(formatter);
                    List<Transaction> txs = entry.getValue();

                    double totalIncome = txs.stream()
                            .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                            .mapToDouble(t -> getConvertedAmount(t, userId))
                            .sum();

                    double totalExpense = txs.stream()
                            .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                            .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
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
    @Override
    public List<TransactionResponse> getTopTransactionsByAmount(String userId, LocalDate startDate, LocalDate endDate, int limit, TransactionType type) {
        if (userId == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        if (limit <= 0) {
            return List.of();
        }

        List<TransactionResponse> all = getTransactionsByUser(userId, null, null, null, startDate, endDate, type, null);

        return all.stream()
                .sorted((t1, t2) -> Double.compare(Math.abs(t2.getPrice()), Math.abs(t1.getPrice())))
                .limit(limit)
                .toList();
    }

    @Override
    public double calculateQuarterlySavingsRate(String userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);

        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate)
        );

        List<Transaction> transactions = transactionRepository.findAll(spec);

        double totalIncome = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                .mapToDouble(t -> getConvertedAmount(t, userId))
                .sum();

        double totalExpense = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                .sum();

        if (totalIncome == 0) {
            return -1.0;
        }

        return (totalIncome - totalExpense) / totalIncome;
    }

    private double getConvertedAmount(Transaction t, String userId) {
        return t.getPrice();
//        String fromCurrency = t.getAccount().getCurrencyCode().getCode();
//        String toCurrency = userId.getMainCurrency().getCode();
//
//        if (fromCurrency.equals(toCurrency)) {
//            return t.getPrice();
//        }
//
//        return exchangeRateRepository.findByFromCurrencyAndToCurrency(fromCurrency, toCurrency)
//                .map(rate -> t.getPrice() * rate.getRate())
//                .orElseThrow(() -> new IllegalArgumentException("Exchange rate not found for " + fromCurrency + " -> " + toCurrency));
    }

    @Override
    public List<DailyOverviewDto> getDailyOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type) {
        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(type)
        );

        List<Transaction> transactions = transactionRepository.findAll(spec);

        Map<LocalDate, Double> sums = transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCreatedAt,
                        Collectors.summingDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                ));

        return startDate.datesUntil(endDate.plusDays(1))
                .map(date -> new DailyOverviewDto(
                        date,
                        Math.round(sums.getOrDefault(date, 0.0) * 100.0) / 100.0
                ))
                .toList();
    }

    @Override
    public double getIncome(String userId, LocalDate startDate, LocalDate endDate) {
        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.INCOME)
        );

        return transactionRepository.findAll(spec).stream()
                .mapToDouble(t -> getConvertedAmount(t, userId))
                .sum();
    }

    @Override
    public Map<CategoryGroup, Map<String, Double>> getSpendingDetailsByGroup(String userId, LocalDate startDate, LocalDate endDate) {
        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.EXPENSE)
        );
        List<Transaction> transactions = transactionRepository.findAll(spec);

        Map<String, CategoryGroup> categoryGroupsMap = categoryService.findAllByUser(userId).stream()
                .filter(c -> c.getCategoryGroup() != null)
                .collect(Collectors.toMap(
                        Category::getName,
                        Category::getCategoryGroup,
                        (existing, replacement) -> existing
                ));


        Map<CategoryGroup, Map<String, Double>> result = new HashMap<>();

        for (Transaction t : transactions) {
            CategoryGroup group = categoryGroupsMap.get(t.getCategory().getName());

            if (group != null) {
                double amount = Math.abs(getConvertedAmount(t, userId));

                result.computeIfAbsent(group, k -> new HashMap<>())
                        .merge(t.getCategory().getName(), amount, Double::sum);
            }
        }

        return result;
    }

    @Override
    public double getAverageMonthlyExpenses(String userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.EXPENSE)
        );

        double totalExpenses = transactionRepository.findAll(spec).stream()
                .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                .sum();

        return totalExpenses / months;
    }

    @Override
    public double getAverageMonthlyIncome(String userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.INCOME)
        );

        double totalIncome = transactionRepository.findAll(spec).stream()
                .mapToDouble(t -> getConvertedAmount(t, userId))
                .sum();

        if (months == 0) return totalIncome;

        return totalIncome / months;
    }

    @Override
    public boolean hasSufficientExpenseData(String userId, int daysBack, int minDistinctDays) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(daysBack);

        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.EXPENSE)
        );

        List<Transaction> transactions = transactionRepository.findAll(spec);

        long distinctDaysWithExpenses = transactions.stream()
                .map(Transaction::getCreatedAt)
                .distinct()
                .count();

        return distinctDaysWithExpenses >= minDistinctDays;
    }

    public double calculateSafetyNetRatio(String userId) {
        double avgExpenses = getAverageMonthlyExpenses(userId, 3);
        double totalBalance = accountService.getUserBalance(userId).balance();
        if (avgExpenses == 0) return 0.0;
        return totalBalance / avgExpenses;
    }

    @Override
    public double getAverageDailySpend(String userId, int daysBack) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(daysBack);

        Specification<Transaction> spec = Specification.allOf(
                TransactionSpecifications.hasUserId(userId),
                TransactionSpecifications.dateBetween(startDate, endDate),
                TransactionSpecifications.type(TransactionType.EXPENSE)
        );

        double totalExpenses = transactionRepository.findAll(spec).stream()
                .mapToDouble(t -> Math.abs(getConvertedAmount(t, userId)))
                .sum();

        if (daysBack == 0) return totalExpenses;

        return totalExpenses / daysBack;
    }

    @Override
    public Map<YearMonth, Map<CategoryGroup, Double>> getMonthlyGroupSpending(String userId, int monthsBack) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(monthsBack).withDayOfMonth(1);

        List<Transaction> transactions = transactionRepository.findAll(
                Specification.allOf(
                        TransactionSpecifications.hasUserId(userId),
                        TransactionSpecifications.dateBetween(startDate, endDate),
                        TransactionSpecifications.type(TransactionType.EXPENSE)
                )
        );

        Map<String, CategoryGroup> categoryGroupsMap = categoryService.findAllByUser(userId).stream()
                .filter(c -> c.getCategoryGroup() != null)
                .collect(Collectors.toMap(Category::getName, Category::getCategoryGroup, (a, b) -> a));

        Map<YearMonth, Map<CategoryGroup, Double>> result = new HashMap<>();

        for (Transaction t : transactions) {
            YearMonth month = YearMonth.from(t.getCreatedAt());
            CategoryGroup group = categoryGroupsMap.get(t.getCategory());

            if (group != null) {
                double amount = Math.abs(getConvertedAmount(t, userId));
                result.computeIfAbsent(month, k -> new HashMap<>())
                        .merge(group, amount, Double::sum);
            }
        }
        return result;
    }

    @Override
    public double calculateSpendingVolatility(String userId, int monthsBack) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(monthsBack).withDayOfMonth(1);

        List<MonthOverviewDto> monthlyData = getMonthlyOverview(userId, startDate, endDate);

        if (monthlyData.isEmpty()) return 0.0;

        List<Double> expenses = monthlyData.stream()
                .map(MonthOverviewDto::getTotalExpense)
                .toList();

        double mean = expenses.stream().mapToDouble(val -> val).average().orElse(0.0);
        double variance = expenses.stream()
                .mapToDouble(val -> Math.pow(val - mean, 2))
                .average()
                .orElse(0.0);

        double standardDeviation = Math.sqrt(variance);

        return standardDeviation / mean;
    }

    @Override
    public double calculateSmallTransactionRatio(String userId, int monthsBack) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(monthsBack);
        double threshold = 50.0;

        List<Transaction> transactions = transactionRepository.findAll(
                Specification.allOf(
                        TransactionSpecifications.hasUserId(userId),
                        TransactionSpecifications.dateBetween(startDate, endDate),
                        TransactionSpecifications.type(TransactionType.EXPENSE)
                )
        );

        if (transactions.isEmpty()) return 0.0;

        long smallCount = transactions.stream()
                .filter(t -> Math.abs(t.getPrice()) < threshold)
                .count();

        return (double) smallCount / transactions.size();
    }

    @Override
    public double calculateNeedsTrend(String userId) {
        LocalDate now = LocalDate.now();
        double currentNeeds = getSpendingDetailsByGroup(userId, now.minusDays(30), now)
                .getOrDefault(CategoryGroup.NEEDS, Map.of())
                .values().stream().mapToDouble(d -> d).sum();

        double prevNeeds = getSpendingDetailsByGroup(userId, now.minusDays(60), now.minusDays(30))
                .getOrDefault(CategoryGroup.NEEDS, Map.of())
                .values().stream().mapToDouble(d -> d).sum();

        if (prevNeeds == 0) return 0.0;
        return (currentNeeds - prevNeeds) / prevNeeds;
    }
}
