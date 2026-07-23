package finance_mate.budget.service;

import finance_mate.budget.exception.ErrorCode;
import finance_mate.budget.exception.FinancialGoalException;
import finance_mate.budget.mapper.FinancialGoalMapper;
import finance_mate.budget.model.FinancialGoal;
import finance_mate.budget.model.dto.AccountBalanceDto;
import finance_mate.budget.model.dto.FinancialGoalDto;
import finance_mate.budget.model.dto.FinancialGoalResponseDto;
import finance_mate.budget.publisher.RabbitMQPublisher;
import finance_mate.budget.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardGoalService implements GoalService {

    private final FinancialGoalRepository goalRepository;
    private final FinancialGoalMapper financialGoalMapper;
    private final RabbitMQPublisher rabbitMQPublisher;

    @Override
    public FinancialGoalResponseDto createGoal(String userId, FinancialGoalDto dto) {
        FinancialGoal goal = financialGoalMapper.mapDtoToGoal(dto);
        goal.setUserId(userId);

        if (dto.initialAmount() > 0) {
            goal.setCurrentAmount(dto.initialAmount());
            AccountBalanceDto balanceDto = balanceDto(dto.accountId(), -dto.initialAmount(), userId);
            rabbitMQPublisher.updateAccountBalance(balanceDto);
        } else {
            goal.setCurrentAmount(0);
        }

        FinancialGoal saved = goalRepository.save(goal);
        return financialGoalMapper.mapGoalToDto(saved);
    }

    @Override
    public List<FinancialGoalResponseDto> getGoalsForUser(String userId) {
        return goalRepository.findByUserId(userId)
                .stream()
                .map(financialGoalMapper::mapGoalToDto)
                .toList();
    }

    @Transactional
    @Override
    public FinancialGoalResponseDto depositToGoal(String goalId, double amount, String accountId, String userId) {
        FinancialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new FinancialGoalException(ErrorCode.FINANCIAL_GOAL_NOT_FOUND));

        AccountBalanceDto balanceDto = balanceDto(accountId, -amount, userId);
        rabbitMQPublisher.updateAccountBalance(balanceDto);
        goal.setCurrentAmount(goal.getCurrentAmount() + amount);

        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            double overTarget = goal.getCurrentAmount() - goal.getTargetAmount();
            if (overTarget > 0) {
                AccountBalanceDto balanceDto1 = balanceDto(accountId, overTarget, userId);
                rabbitMQPublisher.updateAccountBalance(balanceDto1);
                goal.setCurrentAmount(goal.getTargetAmount());
            }
            goal.setCompleted(true);
        }

        goalRepository.save(goal);
        return financialGoalMapper.mapGoalToDto(goal);
    }

    @Override
    @Transactional
    public FinancialGoalResponseDto withdrawFromGoal(String goalId, double amount, String accountId, String userId) {
        FinancialGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new FinancialGoalException(ErrorCode.FINANCIAL_GOAL_NOT_FOUND));

        if (goal.isCompleted()) {
            throw new FinancialGoalException(ErrorCode.FINANCIAL_GOAL_LOCKED_EXCEPTION);
        }

        if (goal.getCurrentAmount() - amount < 0) {
            throw new FinancialGoalException(ErrorCode.FINANCIAL_GOAL_FUNDS_EXCEPTION);
        }

        AccountBalanceDto balanceDto = balanceDto(accountId, -amount, userId);
        rabbitMQPublisher.updateAccountBalance(balanceDto);
        goal.setCurrentAmount(goal.getCurrentAmount() - amount);

        goalRepository.save(goal);
        return financialGoalMapper.mapGoalToDto(goal);
    }

    private AccountBalanceDto balanceDto(String accountId, double amount, String userId){
        return AccountBalanceDto.builder()
                .accountId(accountId)
                .amount(amount)
                .userId(userId)
                .build();
    }
}
