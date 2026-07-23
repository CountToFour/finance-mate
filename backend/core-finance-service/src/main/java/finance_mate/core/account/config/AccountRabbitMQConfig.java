package finance_mate.core.account.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccountRabbitMQConfig {

    private static final String ROUTING_KEY = "budget.goal.account";
    private static final String BUDGET_EXCHANGE = "budget.exchange";
    public static final String QUEUE_NAME = "budget.goal.queue";

    @Bean
    public Queue budgetQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange budgetExchange() {
        return new TopicExchange(BUDGET_EXCHANGE);
    }

    @Bean
    public Binding budgetBinding(Queue categoriesQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(categoriesQueue).to(authExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverterAccount() {
        return new JacksonJsonMessageConverter();
    }
}
