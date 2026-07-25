package finance_mate.budget.publisher;

import finance_mate.budget.config.RabbitMQConfig;
import finance_mate.budget.model.dto.AccountBalanceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void updateAccountBalance(AccountBalanceDto dto) {
        log.info("Publishing message to change account {} balance for userId: {}", dto.getAccountId(), dto.getUserId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.BUDGET_EXCHANGE, RabbitMQConfig.GOAL_ACCOUNT_QUEUE, dto);
    }
}
