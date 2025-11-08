package com.financemate.recommendation.integration;

import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


@Service
@RequiredArgsConstructor
public class TwelveDataClient {

    private final WebClient twelveDataWebClient;

    @Value("${twelve.data.api.key}")
    private String apiKey;

    public TwelveDataTimeSeriesResponse getTimeSeries(String symbol, String interval, String startDate) {
        TwelveDataTimeSeriesResponse response = twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("symbol", symbol)
                        .queryParam("interval", interval)
                        .queryParam("start_date", startDate)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TwelveDataTimeSeriesResponse.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Empty response from TwelveData for symbol: " + symbol);
        }

        return response;
    }
}
