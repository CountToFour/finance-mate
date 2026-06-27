package finance_mate.core.account.communication;

import finance_mate.core.account.model.dto.ExchangeRateDto;
import finance_mate.core.account.model.dto.ExchangeRateResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class ExchangeRateApiClient {

    private final WebClient webClient;

    public ExchangeRateApiClient(WebClient.Builder builder,
                               @Value("${exchange.api.key}") String apiKey) {
        String baseUrl = String.format("https://v6.exchangerate-api.com/v6/%s/pair/", apiKey);
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public ExchangeRateDto getExchangeRate(String fromCurrency, String toCurrency) {
        return webClient.get()
                .uri("{fromCurrency}/{toCurrency}/", fromCurrency, toCurrency)
                .retrieve()
                .bodyToMono(ExchangeRateDto.class)
                .block();
    }

    public Mono<ExchangeRateResult> fetchExchangeRate(String from, String to) {
        return webClient.get()
                .uri("{fromCode}/{toCode}/", from, to)
                .retrieve()
                .bodyToMono(ExchangeRateDto.class)
                .map(response -> {
                    if (response != null && "success".equals(response.getResult())) {
                        return new ExchangeRateResult(from, to, response.getConversion_rate());
                    }
                    throw new RuntimeException("Failed to fetch exchange rate");
                })
                .onErrorResume(e -> {
                    log.error("Error fetching exchange rate for {} to {}: {}", from, to, e.getMessage());
                    return Mono.empty();
                });
    }


}
