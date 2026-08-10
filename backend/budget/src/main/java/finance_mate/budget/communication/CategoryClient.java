package finance_mate.budget.communication;

import finance_mate.budget.exception.BudgetException;
import finance_mate.budget.exception.ErrorCode;
import finance_mate.budget.model.dto.CategoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
public class CategoryClient {

    private final WebClient webClient;
    private static final String CATEGORY_URL = "http://localhost:8082/api/categories";

    public CategoryClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl(CATEGORY_URL).build();
    }

    public CategoryResponse getCategory(String id) {
        return webClient.get()
                .uri("/{id}", id)
                .retrieve()
                .onStatus(
                        status -> status.isSameCodeAs(HttpStatus.NOT_FOUND),
                        response -> Mono.error(new BudgetException(ErrorCode.CATEGORY_NOT_FOUND))
                )
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new BudgetException(ErrorCode.CATEGORY_SERVICE_EXCEPTION))
                )
                .bodyToMono(CategoryResponse.class)
                .timeout(Duration.ofSeconds(5))
                .retryWhen(Retry.backoff(5, Duration.ofSeconds(1))
                        .filter(throwable -> {
                            if (throwable instanceof BudgetException ex) {
                                return ex.getErrorCode() != ErrorCode.CATEGORY_NOT_FOUND;
                            }
                            return true;
                        })
                )
                .block();
    }
}
