package finance_mate.budget.service;

import finance_mate.budget.communication.CategoryClient;
import finance_mate.budget.exception.BudgetException;
import finance_mate.budget.exception.ErrorCode;
import finance_mate.budget.mapper.BudgetMapper;
import finance_mate.budget.model.Budget;
import finance_mate.budget.model.dto.BudgetDto;
import finance_mate.budget.model.dto.BudgetResponseDto;
import finance_mate.budget.model.dto.CategoryResponse;
import finance_mate.budget.model.dto.UpdateBudgetDto;
import finance_mate.budget.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandardBudgetService implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;
    private final CategoryClient categoryClient;
//    private final CurrencyService currencyService;

    @Override
    public BudgetResponseDto createBudget(String userId, BudgetDto dto) {
        CategoryResponse category = categoryClient.getCategory(dto.categoryId());

        Optional<Budget> existing = budgetRepository.findByCategoryIdAndActive(dto.categoryId(), true);
        if (existing.isPresent()) {
            throw new BudgetException(ErrorCode.BUDGET_EXISTS_ERROR);
        }

        LocalDate start = dto.startDate() != null ? dto.startDate() : LocalDate.now();
        LocalDate end = start.plusMonths(1);

        Budget budget = budgetMapper.mapDtoToBudget(dto);
        budget.setSpentAmount(0);
        budget.setUserId(userId);
        budget.setCategoryId(dto.categoryId());
        budget.setCategoryName(category.getName());
        budget.setStartDate(start);
        budget.setEndDate(end);
        budget.setActive(true);

        budgetRepository.save(budget);
        return budgetMapper.mapBudgetToResponseDto(budget);
    }

//    @Override
//    public void updateSpentAmount(Category category, double amount, String accountCurrency, String userCurrency) {
//        Optional<Budget> budget = budgetRepository.findByCategoryIdAndActive(category, true);
//        if (budget.isEmpty()) {
//            log.warn("No active budget found for category: {}", category.getName());
//            return;
//        }
//        double newValue = amount;
//        if (!accountCurrency.equals(userCurrency)) {
//            ExchangeRateDto exchangeRateByPair = currencyService.getExchangeRateByPair(accountCurrency, userCurrency);
//            newValue = amount * exchangeRateByPair.getConversion_rate();
//        }
//        Budget b = budget.get();
//        b.setSpentAmount(b.getSpentAmount() + newValue);
//        budgetRepository.save(b);
//    }

    @Override
    public List<BudgetResponseDto> getBudgetsForUser(String userId) {
        return budgetRepository.findByUserIdAndActive(userId, true).stream().map(budgetMapper::mapBudgetToResponseDto).toList();
    }

    @Override
    public BudgetResponseDto getBudgetById(String id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new BudgetException(ErrorCode.BUDGET_NOT_FOUND));
        return budgetMapper.mapBudgetToResponseDto(budget);
    }

    @Transactional
    @Override
    public BudgetResponseDto updateBudget(String id, UpdateBudgetDto dto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new BudgetException(ErrorCode.BUDGET_NOT_FOUND));

        if (Double.compare(dto.getLimitAmount(), budget.getLimitAmount()) != 0) {
            budget.setLimitAmount(dto.getLimitAmount());
        }

        budgetRepository.save(budget);
        return budgetMapper.mapBudgetToResponseDto(budget);
    }

    @Transactional
    @Override
    public void deleteBudget(String id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new BudgetException(ErrorCode.BUDGET_NOT_FOUND));
        budgetRepository.delete(budget);
    }
}

