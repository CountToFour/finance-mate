package finance_mate.budget.service;

import finance_mate.budget.model.dto.FinancialGoalDto;
import finance_mate.budget.model.dto.FinancialGoalResponseDto;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;

public interface GoalService {
    FinancialGoalResponseDto createGoal(String userId, FinancialGoalDto dto);
    List<FinancialGoalResponseDto> getGoalsForUser(String userId);
    FinancialGoalResponseDto depositToGoal(String goalId, double amount, String accountId, String userId);
    FinancialGoalResponseDto withdrawFromGoal(String goalId, double amount, String accountId, String userId);

    @Scheduled(cron = "0 0 1 * * *")
    void getFundsForGoal();
}
