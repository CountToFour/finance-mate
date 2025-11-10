package com.financemate.account.dto;

import com.financemate.account.model.Currency;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountResponse {
    private String id;
    private String name;
    private String description;
    private String currencySymbol;
    private double balance;
    private String color;
    private boolean includeInStats;
    private boolean archived;
}
