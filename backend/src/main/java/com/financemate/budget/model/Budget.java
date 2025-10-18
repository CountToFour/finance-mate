package com.financemate.budget.model;

import com.financemate.auth.model.user.User;
import com.financemate.category.model.Category;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "budgets", indexes = {
        @Index(name = "idx_budget_user_category_period", columnList = "userId, categoryId, periodStart, periodEnd, status")
})
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category categoryId;

    @Enumerated(EnumType.STRING)
    private BudgetPeriodType periodType;

    @Column(nullable = false)
    private LocalDate periodStart;

    @Column(nullable = false)
    private LocalDate periodEnd;

    private double amount;

    private double spent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BudgetStatus status;

    public boolean isActiveOn(LocalDate date) {
        return status == BudgetStatus.OPEN && (date.isEqual(periodStart) || date.isAfter(periodStart)) && (date.isEqual(periodEnd) || date.isBefore(periodEnd));
    }

    public void addExpense(double expense) {
        if (expense <= 0) {
            throw new IllegalArgumentException("Kwota wydatku musi być dodatnia");
        }
        if (spent == 0) spent = 0;
        spent += expense;
    }

    public double getRemaining() {
        return amount - spent;
    }

    public void close() {
        this.status = BudgetStatus.CLOSED;
    }

    public static LocalDate startOfMonth(LocalDate date) {
        return date.withDayOfMonth(1);
    }

    public static LocalDate endOfMonth(LocalDate date) {
        return date.withDayOfMonth(date.lengthOfMonth());
    }
}