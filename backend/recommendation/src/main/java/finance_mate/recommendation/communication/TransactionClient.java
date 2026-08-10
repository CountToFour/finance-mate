package finance_mate.recommendation.communication;

import finance_mate.recommendation.exception.ErrorCode;
import finance_mate.recommendation.exception.RecommendationException;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
public class TransactionClient {

    private final WebClient webClient;
    private static final String TRANSACTION_URL = "http://localhost:8082/api/transactions";

    public TransactionClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl(TRANSACTION_URL).build();
    }

    public Double calculateQuarterlySavingsRate(String userId) {
        return webClient.get()
                .uri("/recommendation/savings-rate/{userId}", userId)
                .retrieve()
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new RecommendationException(ErrorCode.TRANSACTION_CONNECTION_EXCEPTION))
                )
                .bodyToMono(Double.class)
                .timeout(Duration.ofSeconds(5))
                .retryWhen(Retry.backoff(5, Duration.ofSeconds(1)))
                .block();
    }
}
