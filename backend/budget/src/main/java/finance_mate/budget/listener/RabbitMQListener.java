package finance_mate.budget.listener;

import finance_mate.budget.config.RabbitMQConfig;
import finance_mate.budget.model.dto.BudgetProgressDto;
import finance_mate.budget.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQListener {

    private final BudgetService budgetService;

    @RabbitListener(queues = RabbitMQConfig.TRANSACTION_QUEUE)
    public void updateService(BudgetProgressDto dto) {
        log.info("Updating budget for category with id: {}", dto.getCategoryId());
        try {
            budgetService.updateSpentAmount(dto);
            log.info("Budget spent updated successfully");
        } catch (Exception e) {
            log.error("Error while updating budget spent for category with id {} : {}", dto.getCategoryId(), e.getMessage());
        }
    }
}
