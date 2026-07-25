package finance_mate.core.rabbit.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CoreRabbitMQConfig {

    //FOR ACCOUNT
    private static final String GOAL_ACCOUNT_ROUTING_KEY = "goal.account.update";
    public static final String BUDGET_EXCHANGE = "budget.exchange";
    public static final String GOAL_ACCOUNT_QUEUE = "goal.account.queue";

    //FOR CATEGORIES
    private static final String USER_CATEGORY_ROUTING_KEY = "user.categories.assign";
    private static final String AUTH_EXCHANGE = "auth.exchange";
    public static final String CATEGORY_QUEUE = "user.categories.queue";

    //FOR TRANSACTIONS
    public static final String TRANSACTION_QUEUE = "transaction.budget.queue";

    //FOR ACCOUNT
    @Bean
    public Queue goalAccountQueue() {
        return new Queue(GOAL_ACCOUNT_QUEUE, true);
    }

    @Bean
    public TopicExchange budgetExchange() {
        return new TopicExchange(BUDGET_EXCHANGE);
    }

    @Bean
    public Binding goalAccountBinding(Queue goalAccountQueue, TopicExchange budgetExchange) {
        return BindingBuilder.bind(goalAccountQueue).to(budgetExchange).with(GOAL_ACCOUNT_ROUTING_KEY);
    }

    //FOR CATEGORIES
    @Bean
    public Queue categoriesQueue() {
        return new Queue(CATEGORY_QUEUE, true);
    }

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE);
    }

    @Bean
    public Binding authBinding(Queue categoriesQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(categoriesQueue).to(authExchange).with(USER_CATEGORY_ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverterAccount() {
        return new JacksonJsonMessageConverter();
    }
}
