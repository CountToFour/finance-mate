package finance_mate.core.account.service;

import finance_mate.core.account.communication.ExchangeRateApiClient;
import finance_mate.core.account.model.Currency;
import finance_mate.core.account.model.ExchangeRate;
import finance_mate.core.account.model.dto.CurrencyDto;
import finance_mate.core.account.model.dto.CurrencyResponse;
import finance_mate.core.account.model.dto.ExchangeRateDto;
import finance_mate.core.account.repository.CurrencyRepository;
import finance_mate.core.account.repository.ExchangeRateRepository;
import finance_mate.core.exception.CurrencyException;
import finance_mate.core.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.util.Pair;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class StandardCurrencyService implements CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateApiClient exchangeRateApiClient;

//    @PostConstruct
    public void setCurrencyRates() {
        List<Currency> currencies = currencyRepository.findAll();

        for (int i = 0; i < currencies.size(); i++) {
            Currency fromCurrency = currencies.get(i);
            for (int j = i + 1; j < currencies.size(); j++) {
                Currency toCurrency = currencies.get(j);

                try {
                    double rate = getExchangeRate(fromCurrency.getCode(), toCurrency.getCode());
                    saveExchangeRate(fromCurrency.getCode(), toCurrency.getCode(), rate);

                    double reverseRate = 1.0 / rate;
                    saveExchangeRate(toCurrency.getCode(), fromCurrency.getCode(), reverseRate);
                } catch (Exception e) {
                    log.error("Error fetching exchange rate for {} to {}: {}", fromCurrency.getCode(), toCurrency.getCode(), e.getMessage());
                }
            }
        }
    }

    @Override
    public List<CurrencyResponse> findAllCurrencies() {
        return currencyRepository.findAll().stream().map(this::mapCurrencyToDto).collect(Collectors.toList());
    }

    @Override
    public void addCurrency(CurrencyDto currency) {
        if (currencyRepository.findById(currency.getCode().toUpperCase()).isPresent()) {
            log.error("Currency with code {} already exists.", currency.getCode());
            throw new CurrencyException(ErrorCode.CURRENCY_ALREADY_EXISTS);
        }

        Currency newCurrency = Currency.builder()
                .code(currency.getCode().toUpperCase())
                .name(currency.getName())
                .symbol(currency.getSymbol())
                .build();

        currencyRepository.save(newCurrency);
    }

    @Override
    public void deleteCurrency(String code) {
        //TODO DELETE ALSO RATES
        currencyRepository.findById(code.toUpperCase()).orElseThrow(() -> {
            log.error("Currency with code {} does not exist.", code);
            return new CurrencyException(ErrorCode.CURRENCY_NOT_FOUND);
        });
        currencyRepository.deleteById(code);
    }

    @Override
    public CurrencyResponse getCurrencyByCode(String code) {
        Currency currency = currencyRepository.findById(code.toUpperCase()).orElseThrow(()-> {
            log.error("Currency with code {} does not exist.", code);
            return new CurrencyException(ErrorCode.CURRENCY_NOT_FOUND);
        });
        return mapCurrencyToDto(currency);
    }

    @Override
    public ExchangeRateDto getExchangeRateByPair(String fromCurrency, String toCurrency) {
        ExchangeRate exchangeRate = exchangeRateRepository
                .findByFromCurrencyAndToCurrency(fromCurrency.toUpperCase(), toCurrency.toUpperCase())
                .orElseThrow(() -> {
                    log.error("Exchange rate for " + fromCurrency + " to " + toCurrency + " not found.");
                    return new CurrencyException(ErrorCode.CURRENCY_RATE_NOT_FOUND);
                });

        ExchangeRateDto dto = new ExchangeRateDto();
        dto.setBase_code(fromCurrency.toUpperCase());
        dto.setTarget_code(toCurrency.toUpperCase());
        dto.setConversion_rate(exchangeRate.getRate());

        //TODO WHY HERE IS RESULT?
        dto.setResult("success");

        return dto;
    }

    private double getExchangeRate(String fromCode, String toCode) {
        ExchangeRateDto response = exchangeRateApiClient.getExchangeRate(fromCode, toCode);

        if (response != null && "success".equals(response.getResult())) {
            return response.getConversion_rate();
        }

        log.error("Failed to fetch exchange rate");
        throw new CurrencyException(ErrorCode.CURRENCY_FETCH_ERROR);
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

//    @Scheduled(cron = "0 30 * * * ?")
    @CacheEvict(value = "exchangeRates", allEntries = true)
    public void updateExchangeRates() {
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

                    return exchangeRateApiClient.fetchExchangeRate(from, to);
                }, 5)
                .doOnNext(result -> {
                    saveExchangeRate(result.from(), result.to(), result.rate());
                    saveExchangeRate(result.to(), result.from(), 1.0 / result.rate());
                })
                .blockLast();

        log.info("Exchange rates updated at {}", LocalDateTime.now());
    }

    private CurrencyResponse mapCurrencyToDto(Currency currency) {
        return CurrencyResponse.builder()
                .name(currency.getName())
                .symbol(currency.getSymbol())
                .code(currency.getCode())
                .build();
    }
}
