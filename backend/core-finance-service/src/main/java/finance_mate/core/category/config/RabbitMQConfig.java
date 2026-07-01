package finance_mate.core.category.config;

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

    private static final String ROUTING_KEY = "user.categories.assign";
    private static final String AUTH_EXCHANGE = "auth.exchange";
    public static final String QUEUE_NAME = "user.categories.queue";

    @Bean
    public Queue categoriesQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE);
    }

    @Bean
    public Binding authBinding(Queue categoriesQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(categoriesQueue).to(authExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
