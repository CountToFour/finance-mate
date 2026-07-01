package finance_mate.auth.publisher;

import finance_mate.auth.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void assignDefaultCategories(String userId) {
        log.info("Publishing message to assign default categories for userId: {}", userId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.AUTH_EXCHANGE, "user.categories.assign", userId);
    }
}
