package com.financemate.account.service;

import com.financemate.account.model.Currency;
import com.financemate.account.repository.CurrencyRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final WebClient webClient;

    public CurrencyService(CurrencyRepository currencyRepository, WebClient webClient) {
        this.webClient = webClient;
        this.currencyRepository = currencyRepository;
    }

    @PostConstruct
    public void setCurrencyRates() {
        List<Currency> currencies = currencyRepository.findAll();


    }

    public List<Currency> findAllCurrencies() {
        return currencyRepository.findAll();
    }

    public void addCurrency(Currency currency) {
        if (currencyRepository.findById(currency.getCode().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Currency with code " + currency.getCode() + " already exists.");
        }
        currencyRepository.save(currency);
    }

    public void deleteCurrency(String code) {
        currencyRepository.findById(code.toUpperCase()).orElseThrow(()
                -> new IllegalArgumentException("Currency with code " + code + " does not exist."));
        currencyRepository.deleteById(code);
    }

    public Currency getCurrencyByCode(String code) {
        currencyRepository.findById(code.toUpperCase()).orElseThrow(()
                -> new IllegalArgumentException("Currency with code " + code + " does not exist."));
        return currencyRepository.findById(code).isPresent() ? currencyRepository.findById(code).get() : null;
    }

    private String getExchangeRate(String code) {
        return webClient.get()
                .uri("/{table}/{code}/", "A", code)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

}
