package finance_mate.core.rabbit.publish;

import finance_mate.core.rabbit.config.CoreRabbitMQConfig;
import finance_mate.core.transaction.model.dto.BudgetProgressDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CoreRabbitMQPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void updateBudget(BudgetProgressDto dto) {
        log.info("Publishing message to update budget for category with id {}", dto.getCategoryId());
        rabbitTemplate.convertAndSend(CoreRabbitMQConfig.BUDGET_EXCHANGE, CoreRabbitMQConfig.TRANSACTION_QUEUE, dto);
    }
}
