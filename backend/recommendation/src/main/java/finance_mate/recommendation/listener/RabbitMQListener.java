package finance_mate.recommendation.listener;

import finance_mate.recommendation.config.RabbitMQConfig;
import finance_mate.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMQListener {

    private final RecommendationService recommendationService;

    @RabbitListener(queues = RabbitMQConfig.TRANSACTION_QUEUE)
    public void updateInvestmentProfile(String userId) {
        log.info("Updating investment profile for user with id: {}", userId);
        try {
            recommendationService.calculateUserProfile(userId);
            log.info("User investment profile updated successfully");
        } catch (Exception e) {
            log.error("Error while updating investment profile for user with id {} : {}", userId, e.getMessage());
        }
    }
}
