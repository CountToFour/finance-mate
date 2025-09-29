package com.financemate.account.service;

import com.financemate.account.dto.ExchangeRateDto;
import com.financemate.account.model.Currency;

import java.util.List;

public interface CurrencyService {
     List<Currency> findAllCurrencies();
     void addCurrency(Currency currency);
     void deleteCurrency(String code);
     Currency getCurrencyByCode(String code);
     ExchangeRateDto getExchangeRateByPair(String fromCurrency, String toCurrency);
}
