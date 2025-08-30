package com.financemate.expenses.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "recurring_expenses")
public class RecurringExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String userId;
    private String category;
    private BigDecimal price;
    @Nullable
    private String description;
    @Enumerated(EnumType.STRING)
    private PeriodType periodType;
    private LocalDate expenseDate;
    private boolean active;
    private LocalDate lastGeneratedDate;

}
