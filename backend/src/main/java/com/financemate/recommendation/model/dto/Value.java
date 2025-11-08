package com.financemate.recommendation.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Value {
    private String datetime;
    private String open;
    private String high;
    private String low;
    private String close;
    private String volume;
}
