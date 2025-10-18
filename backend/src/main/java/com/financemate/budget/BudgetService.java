package com.financemate.budget;

import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.UserRepository;
import com.financemate.budget.dto.BudgetDto;
import com.financemate.budget.mapper.BudgetMapper;
import com.financemate.budget.model.Budget;
import com.financemate.budget.model.BudgetPeriodType;
import com.financemate.budget.model.BudgetStatus;
import com.financemate.budget.repository.BudgetRepository;
import com.financemate.category.model.Category;
import com.financemate.category.repository.CategoryRepository;
import com.financemate.transaction.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetMapper budgetMapper;

    @Transactional
    public BudgetDto createMonthlyBudget(String userId, String categoryId, double amount, LocalDate anchorDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        LocalDate start = Budget.startOfMonth(anchorDate);
        LocalDate end = Budget.endOfMonth(anchorDate);
        Budget budget = Budget.builder()
                .user(user)
                .categoryId(category)
                .periodType(BudgetPeriodType.MONTHLY)
                .periodStart(start)
                .periodEnd(end)
                .amount(amount)
                .spent(0)
                .status(BudgetStatus.OPEN)
                .build();
        return budgetMapper.mapToDto(budgetRepository.save(budget));
    }

    @Transactional
    public Budget addExpense(String userId, String categoryId, double expenseAmount, LocalDate when) {
        Budget budget = budgetRepository
                .findFirstByUserIdAndCategoryIdAndPeriodTypeAndStatusAndPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(
                        userId, categoryId, BudgetPeriodType.MONTHLY, BudgetStatus.OPEN, when, when
                )
                .orElseGet(() -> createMonthlyBudget(userId, categoryId, 0, when)); // fallback: tworzy budżet 0 zł, by nie zgubić wydatku

        budget.addExpense(expenseAmount);
        return budgetRepository.save(budget);
    }

//    @Transactional
//    public int rolloverDueBudgets(String userId, LocalDate today) {
//        var due = budgetRepository.findAllByUserIdAndStatusAndPeriodEndBefore(userId, BudgetStatus.OPEN, today);
//        int created = 0;
//        for (Budget b : due) {
//            // zamknij stary
//            b.close();
//            budgetRepository.save(b);
//            // utwórz nowy na kolejny miesiąc z tą samą kwotą
//            LocalDate nextMonth = b.getPeriodEnd().plusDays(1); // pierwszy dzień kolejnego miesiąca
//            var newBudget = Budget.builder()
//                    .id(UUID.randomUUID())
//                    .userId(b.getUserId())
//                    .categoryId(b.getCategoryId())
//                    .periodType(BudgetPeriodType.MONTHLY)
//                    .periodStart(Budget.startOfMonth(nextMonth))
//                    .periodEnd(Budget.endOfMonth(nextMonth))
//                    .amount(b.getAmount())
//                    .spent(BigDecimal.ZERO)
//                    .status(BudgetStatus.OPEN)
//                    .build();
//            budgetRepository.save(newBudget);
//            created++;
//        }
//        return created;
//    }
}

