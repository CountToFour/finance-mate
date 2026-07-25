package finance_mate.core.rabbit.listener;

import finance_mate.core.account.model.dto.AccountBalanceDto;
import finance_mate.core.account.service.AccountService;
import finance_mate.core.category.service.CategoryService;
import finance_mate.core.rabbit.config.CoreRabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CoreRabbitMQListener {

    private final AccountService accountService;
    private final CategoryService categoryService;

    @RabbitListener(queues = CoreRabbitMQConfig.GOAL_ACCOUNT_QUEUE)
    public void updateAccountBalance(AccountBalanceDto dto) {
        log.info("Updating user with id: {} account {} balance", dto.getUserId(), dto.getAccountId());
        try {
            accountService.changeBalance(dto.getAccountId(), dto.getAmount(), dto.getUserId());
            log.info("Account balance changed successfully");
        } catch (Exception e) {
            log.error("Error while changing account balance for user {}: {}", dto.getUserId(), e.getMessage());
        }
    }

    @RabbitListener(queues = CoreRabbitMQConfig.CATEGORY_QUEUE)
    public void assignCategories(String userId) {
        log.info("Assigning categories to user: {}", userId);
        try {
            categoryService.assignCategoriesToUser(userId);
        } catch (Exception e) {
            log.error("Error while assigning categories to user {}: {}", userId, e.getMessage());
        }
    }
}
