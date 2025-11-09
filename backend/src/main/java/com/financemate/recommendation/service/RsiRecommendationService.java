package com.financemate.recommendation.service;

import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.RecommendationAction;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.model.dto.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RsiRecommendationService {

    private final TwelveDataClient twelveDataClient;

    public RsiRecommendation calculateRsi(TwelveDataTimeSeriesResponse twelveDataTimeSeriesResponse) {
        List<Value> values = twelveDataTimeSeriesResponse.getValues();
        if (values == null) {
            throw new IllegalArgumentException("Value list is null");
        }

        values.sort(Comparator.comparing(v -> parseDateTimeOrDate(v.getDatetime())));

        List<Double> closes = new ArrayList<>();
        List<String> datetimes = new ArrayList<>();
        for (Value v : values) {
            try {
                closes.add(Double.parseDouble(v.getClose()));
                datetimes.add(v.getDatetime());
            } catch (NumberFormatException e) {
                continue;
            }
        }

        double rsi = computeRsi(closes);
        double latestClose = closes.getLast();
        String latestDatetime = datetimes.getLast();

        RecommendationAction action = RecommendationAction.HOLD;

        if (rsi >= 0) {
            if (rsi < 30.0) action = RecommendationAction.BUY;
            else if (rsi > 70.0) action = RecommendationAction.SELL;
        }

        return RsiRecommendation.builder()
                .symbol(twelveDataTimeSeriesResponse.getMeta().getSymbol())
                .rsiValue(rsi)
                .action(action)
                .latestClose(latestClose)
                .latestDatetime(latestDatetime)
                .build();
    }

    private double computeRsi(List<Double> closes) {
        double avgGain = 0.0;
        double avgLoss = 0.0;
        for (int i = 1; i < closes.size(); i++) {
            double change = closes.get(i) - closes.get(i - 1);
            if (change > 0) {
                avgGain += change;
            } else {
                avgLoss += Math.abs(change);
            }
        }

        avgGain /= closes.size();
        avgLoss /= closes.size();

        if (avgLoss == 0) {
            return 100.0;
        }

        double rs = avgGain / avgLoss;
        return 100.0 - (100.0 / (1.0 + rs));
    }

    private LocalDateTime parseDateTimeOrDate(String s) {
        if (s == null) return LocalDateTime.MIN;
        DateTimeFormatter[] fmts = new DateTimeFormatter[] {
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ISO_DATE_TIME,
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("yyyy-MM-dd")
        };
        for (DateTimeFormatter fmt : fmts) {
            try {
                if (fmt == DateTimeFormatter.ISO_LOCAL_DATE) {
                    LocalDate ld = LocalDate.parse(s, fmt);
                    return ld.atStartOfDay();
                } else {
                    return LocalDateTime.parse(s, fmt);
                }
            } catch (DateTimeParseException ignored) {
            }
        }
        try {
            LocalDate ld = LocalDate.parse(s);
            return ld.atStartOfDay();
        } catch (DateTimeParseException ex) {
            return LocalDateTime.MIN;
        }
    }
}

