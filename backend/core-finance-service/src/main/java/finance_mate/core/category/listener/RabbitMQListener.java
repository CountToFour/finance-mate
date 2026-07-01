package finance_mate.core.category.listener;

import finance_mate.core.category.config.RabbitMQConfig;
import finance_mate.core.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class RabbitMQListener {

    private final CategoryService categoryService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void assignCategories(String userId) {
        log.info("Assigning categories to user: {}", userId);
        try {
            categoryService.assignCategoriesToUser(userId);
        } catch (Exception e) {
            log.error("Error while assigning categories to user {}: {}", userId, e.getMessage());
        }
    }
}
