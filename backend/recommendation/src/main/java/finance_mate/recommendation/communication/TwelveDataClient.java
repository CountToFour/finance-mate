package finance_mate.recommendation.communication;

import finance_mate.recommendation.exception.ErrorCode;
import finance_mate.recommendation.exception.RecommendationException;
import finance_mate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Slf4j
@Component
public class TwelveDataClient {

    private final WebClient twelveDataWebClient;

    @Value("${twelve.data.api.key}")
    private String apiKey;

    public TwelveDataClient(@Value("${twelve.data.api.base-url}") String baseUrl,
                            WebClient.Builder builder) {
        twelveDataWebClient = builder.baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public TwelveDataTimeSeriesResponse getTimeSeries(String symbol, String interval, String startDate) {
        return twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("symbol", symbol)
                        .queryParam("interval", interval)
                        .queryParam("start_date", startDate)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        response -> {
                            log.error(response.statusCode().toString());
                            return Mono.error(new RecommendationException(ErrorCode.TWELVE_DATA_CLIENT_EXCEPTION, response.statusCode().toString()));
                        }
                )
                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new RecommendationException(ErrorCode.TWELVE_DATA_SERVER_EXCEPTION))
                )
                .bodyToMono(TwelveDataTimeSeriesResponse.class)
                .timeout(Duration.ofSeconds(5))
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> {
                            if (throwable instanceof RecommendationException ex) {
                                return ex.getErrorCode() != ErrorCode.TWELVE_DATA_CLIENT_EXCEPTION;
                            }
                            return true;
                        })
                )
                .block();
    }
}
