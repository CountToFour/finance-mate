package finance_mate.core.account.service;

import finance_mate.core.account.model.dto.CurrencyResponse;
import finance_mate.core.account.model.dto.ExchangeRateDto;
import finance_mate.core.account.model.dto.CurrencyDto;

import java.util.List;

public interface CurrencyService {
     List<CurrencyResponse> findAllCurrencies();
     void addCurrency(CurrencyDto currency);
     void deleteCurrency(String code);
     CurrencyResponse getCurrencyByCode(String code);
     ExchangeRateDto getExchangeRateByPair(String fromCurrency, String toCurrency);
}
