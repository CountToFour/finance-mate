package finance_mate.core.transaction.service;

import finance_mate.core.category.model.CategoryGroup;
import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.CategoryDto;
import finance_mate.core.transaction.model.dto.DailyOverviewDto;
import finance_mate.core.transaction.model.dto.EditTransactionDto;
import finance_mate.core.transaction.model.dto.MonthOverviewDto;
import finance_mate.core.transaction.model.dto.RecurringTransactionResponse;
import finance_mate.core.transaction.model.dto.TransactionOverviewDto;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import finance_mate.core.transaction.model.dto.TransactionResponse;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public interface TransactionService {
    @Transactional
    TransactionResponse addTransaction(TransactionRequest dto, String userId);
    List<TransactionResponse> getTransactionsByUser(String userId, String category, Double minPrice, Double maxPrice,
                                                    LocalDate startDate, LocalDate endDate, TransactionType type,
                                                    String accountName);
    @Transactional
    void deleteTransaction(String id);
    @Transactional
    TransactionResponse editTransaction(String id, EditTransactionDto dto);

    TransactionOverviewDto getTransactionOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type);

    List<CategoryDto> getAllCategoriesAmount(String userId, LocalDate startDate, LocalDate endDate, TransactionType type);

    List<MonthOverviewDto> getMonthlyOverview(String userId, LocalDate startDate, LocalDate endDate);

    //TODO COS SIE STANIE JAK BEDZIE MNIEJ REKORDOW NIZ LIMIT
    List<TransactionResponse> getTopTransactionsByAmount(String userId, LocalDate startDate, LocalDate endDate, int limit, TransactionType type);

    double calculateQuarterlySavingsRate(String userId);

    List<DailyOverviewDto> getDailyOverview(String userId, LocalDate startDate, LocalDate endDate, TransactionType type);

    double getIncome(String userId, LocalDate startDate, LocalDate endDate);

    Map<CategoryGroup, Map<String, Double>> getSpendingDetailsByGroup(String userId, LocalDate startDate, LocalDate endDate);

    double getAverageMonthlyExpenses(String userId, int months);

    double getAverageMonthlyIncome(String userId, int months);

    boolean hasSufficientExpenseData(String userId, int daysBack, int minDistinctDays);

    double getAverageDailySpend(String userId, int daysBack);

    Map<YearMonth, Map<CategoryGroup, Double>> getMonthlyGroupSpending(String userId, int monthsBack);

    double calculateSpendingVolatility(String userId, int monthsBack);

    double calculateSmallTransactionRatio(String userId, int monthsBack);

    double calculateNeedsTrend(String userId);
}
