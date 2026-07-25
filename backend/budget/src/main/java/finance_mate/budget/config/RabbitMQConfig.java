package finance_mate.budget.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {


    //FOR ACCOUNTS
    public static final String BUDGET_EXCHANGE = "budget.exchange";
    public static final String GOAL_ACCOUNT_QUEUE = "goal.account.queue";

    //FOR TRANSACTIONS
    public static final String TRANSACTION_QUEUE = "transaction.budget.queue";
    private static final String TRANSACTION_ROUTING_KEY = "transaction.budget.update";

    //FOR ACCOUNTS
    @Bean
    public TopicExchange budgetExchange() {
        return new TopicExchange(BUDGET_EXCHANGE);
    }

    //FOR TRANSACTIONS
    @Bean
    public Queue transactionQueue() {
        return new Queue(TRANSACTION_QUEUE, true);
    }

    @Bean
    public Binding transactionBinding(Queue transactionQueue, TopicExchange budgetExchange) {
        return BindingBuilder.bind(transactionQueue).to(budgetExchange).with(TRANSACTION_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
