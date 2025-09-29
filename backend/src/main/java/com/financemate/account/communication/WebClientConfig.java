package com.financemate.account.communication;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${exchange.api.key}")
    private String apiKey;

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        String baseUrl = String.format("https://v6.exchangerate-api.com/v6/%s/pair/", apiKey);
        return builder.baseUrl(baseUrl).build();
    }
}
