package com.financemate.account.service;

import com.financemate.account.dto.ExchangeRateDto;
import com.financemate.account.model.Currency;
import com.financemate.account.model.ExchangeRate;
import com.financemate.account.repository.CurrencyRepository;
import com.financemate.account.repository.ExchangeRateRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.util.Pair;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class StandardCurrencyService implements CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final WebClient webClient;

    public StandardCurrencyService(CurrencyRepository currencyRepository,
                                   ExchangeRateRepository exchangeRateRepository,
                                   WebClient webClient) {
        this.webClient = webClient;
        this.currencyRepository = currencyRepository;
        this.exchangeRateRepository = exchangeRateRepository;
    }

//    @PostConstruct
//    public void setCurrencyRates() {
//        List<Currency> currencies = currencyRepository.findAll();
//
//        for (int i = 0; i < currencies.size(); i++) {
//            Currency fromCurrency = currencies.get(i);
//            for (int j = i + 1; j < currencies.size(); j++) {
//                Currency toCurrency = currencies.get(j);
//
//                try {
//                    double rate = getExchangeRate(fromCurrency.getCode(), toCurrency.getCode());
//                    saveExchangeRate(fromCurrency.getCode(), toCurrency.getCode(), rate);
//
//                    double reverseRate = 1.0 / rate;
//                    saveExchangeRate(toCurrency.getCode(), fromCurrency.getCode(), reverseRate);
//                } catch (Exception e) {
//                    log.error("Error fetching exchange rate for {} to {}: {}", fromCurrency.getCode(), toCurrency.getCode(), e.getMessage());
//                }
//            }
//        }
//    }

    @Override
    public List<Currency> findAllCurrencies() {
        return currencyRepository.findAll();
    }

    @Override
    public void addCurrency(Currency currency) {
        if (currencyRepository.findById(currency.getCode().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Currency with code " + currency.getCode() + " already exists.");
        }
        currencyRepository.save(currency);
    }

    @Override
    public void deleteCurrency(String code) {
        currencyRepository.findById(code.toUpperCase()).orElseThrow(()
                -> new IllegalArgumentException("Currency with code " + code + " does not exist."));
        currencyRepository.deleteById(code);
    }

    @Override
    public Currency getCurrencyByCode(String code) {
        currencyRepository.findById(code.toUpperCase()).orElseThrow(()
                -> new IllegalArgumentException("Currency with code " + code + " does not exist."));
        return currencyRepository.findById(code).isPresent() ? currencyRepository.findById(code).get() : null;
    }

    @Override
    public ExchangeRateDto getExchangeRateByPair(String fromCurrency, String toCurrency) {
        ExchangeRate exchangeRate = exchangeRateRepository
                .findByFromCurrencyAndToCurrency(fromCurrency.toUpperCase(), toCurrency.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Exchange rate for " + fromCurrency + " to " + toCurrency + " not found."));

        ExchangeRateDto dto = new ExchangeRateDto();
        dto.setBase_code(fromCurrency.toUpperCase());
        dto.setTarget_code(toCurrency.toUpperCase());
        dto.setConversion_rate(exchangeRate.getRate());
        dto.setResult("success");

        return dto;
    }

    private double getExchangeRate(String fromCode, String toCode) {
        ExchangeRateDto response = webClient.get()
                .uri("{fromCode}/{toCode}/", fromCode, toCode)
                .retrieve()
                .bodyToMono(ExchangeRateDto.class)
                .block();

        if (response != null && "success".equals(response.getResult())) {
            return response.getConversion_rate();
        }

        throw new RuntimeException("Failed to fetch exchange rate");

    }

    private void saveExchangeRate(String fromCode, String toCode, double rate) {
        ExchangeRate exchangeRate = exchangeRateRepository.
                findByFromCurrencyAndToCurrency(fromCode, toCode)
                .orElse(new ExchangeRate());

        exchangeRate.setFromCurrency(fromCode);
        exchangeRate.setToCurrency(toCode);
        exchangeRate.setRate(rate);
        exchangeRate.setLastUpdated(LocalDateTime.now());

        exchangeRateRepository.save(exchangeRate);
    }

    @Scheduled(cron = "0 30 * * * ?")
    @CacheEvict(value = "exchangeRates", allEntries = true)
    public void updateExchangeRates() {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        List<Currency> currencies = currencyRepository.findAll();

        List<Pair<Currency, Currency>> currencyPairs = new ArrayList<>();
        for (int i = 0; i < currencies.size(); i++) {
            for (int j = i + 1; j < currencies.size(); j++) {
                currencyPairs.add(Pair.of(currencies.get(i), currencies.get(j)));
            }
        }

        Flux.fromIterable(currencyPairs)
                .flatMap(pair -> {
                    String from = pair.getFirst().getCode();
                    String to = pair.getSecond().getCode();

                    return webClient.get()
                            .uri("{fromCode}/{toCode}/", from, to)
                            .retrieve()
                            .bodyToMono(ExchangeRateDto.class)
                            .map(response -> {
                                if (response != null && "success".equals(response.getResult())) {
                                    return new ExchangeRateResult(from, to, response.getConversion_rate());
                                }
                                throw new RuntimeException("Failed");
                            })
                            .onErrorResume(e -> {
                                log.error("Error for {} to {}", from, to, e);
                                return Mono.empty();
                            });
                }, 5)
                .doOnNext(result -> {
                    saveExchangeRate(result.from, result.to, result.rate);
                    saveExchangeRate(result.to, result.from, 1.0 / result.rate);
                })
                .blockLast();

        stopWatch.stop();

        log.info("Zakończono pobieranie. Czas trwania: {} milisekund ({} sekund)",
                stopWatch.getTotalTimeMillis(),
                stopWatch.getTotalTimeSeconds());
        log.info("Exchange rates updated at {}", LocalDateTime.now());
    }

    private record ExchangeRateResult(String from, String to, double rate) {
    }
}
