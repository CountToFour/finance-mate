package com.financemate.income.model;

import com.financemate.expenses.model.PeriodType;
import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_incomes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringIncome {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String userId;
    private String source;
    private BigDecimal amount;
    private LocalDate date;
    @Nullable
    private String description;
    private PeriodType periodType;
    private boolean active;
    private LocalDate lastGeneratedDate;
}
