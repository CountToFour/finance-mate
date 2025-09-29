package com.financemate.account.controller;

import com.financemate.account.model.Currency;
import com.financemate.account.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/currency")
@CrossOrigin("*")
public class CurrencyController {
    private final CurrencyService standardCurrencyService;

    @GetMapping
    public ResponseEntity<?> findAllCurrencies() {
        try {
            return ResponseEntity.ok(standardCurrencyService.findAllCurrencies());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> addCurrency(@RequestBody Currency currency) {
        try {
            standardCurrencyService.addCurrency(currency);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteCurrency(@PathVariable String code) {
        try {
            standardCurrencyService.deleteCurrency(code);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getCurrencyByCode(@PathVariable String code) {
        try {
            return ResponseEntity.ok(standardCurrencyService.getCurrencyByCode(code));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/exchange-rate/{fromCurrency}/{toCurrency}")
    public ResponseEntity<?> getExchangeRateByPair(@PathVariable String fromCurrency, @PathVariable String toCurrency) {
        try {
            return ResponseEntity.ok(standardCurrencyService.getExchangeRateByPair(fromCurrency, toCurrency));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
