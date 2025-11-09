package com.financemate.recommendation.service;

import com.financemate.recommendation.integration.TwelveDataClient;
import com.financemate.recommendation.model.RsiRecommendation;
import com.financemate.recommendation.model.dto.TwelveDataTimeSeriesResponse;
import com.financemate.recommendation.model.dto.Value;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

class RsiRecommendationServiceTest {

//    @Test
//    void testCalculateRsiWithSyntheticData() {
//        List<Value> values = new ArrayList<>();
//        for (int i = 0; i < 20; i++) {
//            Value v = new Value();
//            v.setDatetime("2025-10-" + String.format("%02d", i + 1));
//            double price = 100 + i;
//            v.setClose(String.valueOf(price));
//            values.add(v);
//        }
//        TwelveDataTimeSeriesResponse response = new TwelveDataTimeSeriesResponse();
//        response.setValues(values);
//
//        TwelveDataClient fakeClient = new TwelveDataClient(null) {
//            @Override
//            public TwelveDataTimeSeriesResponse getTimeSeries(String symbol, String interval, String startDate) {
//                return response;
//            }
//        };
//
//        RsiRecommendationService service = new RsiRecommendationService(fakeClient);
//        RsiRecommendation rec = service.calculateRsi("TEST");
//
//        Assertions.assertNotNull(rec);
//        Assertions.assertTrue(rec.getRsiValue() > 70.0, "RSI expected to be > 70 for steadily increasing prices");
//        Assertions.assertEquals("TEST", rec.getSymbol());
//        Assertions.assertEquals(rec.getAction(), rec.getRsiValue() < 30 ? null : rec.getAction());
//    }


}

