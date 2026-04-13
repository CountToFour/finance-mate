package com.financemate.account.repository;

import com.financemate.account.model.ExchangeRate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, String> {
    @Cacheable(value = "exchangeRates", key = "#fromCurrency + '-' + #toCurrency")
    Optional<ExchangeRate> findByFromCurrencyAndToCurrency(String from, String to);
}
