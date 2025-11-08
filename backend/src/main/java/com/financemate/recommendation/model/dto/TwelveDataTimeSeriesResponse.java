package com.financemate.recommendation.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwelveDataTimeSeriesResponse {
    private MetaData meta;
    private List<Value> values;
}
