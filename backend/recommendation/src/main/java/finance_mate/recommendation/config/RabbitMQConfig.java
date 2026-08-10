package finance_mate.recommendation.config;

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


    public static final String RECOMMENDATION_EXCHANGE = "transaction.exchange";
    public static final String TRANSACTION_QUEUE = "transaction.recommendation.queue";
    private static final String RECOMMENDATION_ROUTING_KEY = "transaction.recommendation.profile";

    @Bean
    public TopicExchange recommendationExchange() {
        return new TopicExchange(RECOMMENDATION_EXCHANGE);
    }

    @Bean
    public Queue transactionQueue() {
        return new Queue(TRANSACTION_QUEUE, true);
    }

    @Bean
    public Binding transactionBinding(Queue transactionQueue, TopicExchange recommendationExchange) {
        return BindingBuilder.bind(transactionQueue).to(recommendationExchange).with(RECOMMENDATION_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
