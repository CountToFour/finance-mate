package finance_mate.core.account.listener;

import finance_mate.core.account.model.dto.AccountBalanceDto;
import finance_mate.core.account.service.AccountService;
import finance_mate.core.account.config.AccountRabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class AccountRabbitMQListener {

    private final AccountService accountService;

    @RabbitListener(queues = AccountRabbitMQConfig.QUEUE_NAME)
    public void updateAccountBalance(AccountBalanceDto dto) {
        log.info("Updating user with id: {} account {} balance", dto.getUserId(), dto.getAccountId());
        try {
            accountService.changeBalance(dto.getAccountId(), dto.getAmount(), dto.getUserId());
            log.info("Account balance changed successfully");
        } catch (Exception e) {
            log.error("Error while changing account balance for user {}: {}", dto.getUserId(), e.getMessage());
        }
    }
}
