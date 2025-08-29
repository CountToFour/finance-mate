package com.financemate.expenses.utils;

import com.financemate.expenses.model.Expense;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseSpecifications {
    public static Specification<Expense> hasUserId(String userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Expense> hasCategory(String category) {
        return (root, query, cb) ->
                category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Expense> amountBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min != null && max != null) {
                return cb.between(root.get("price"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), min);
            } else if (max != null) {
                return cb.lessThanOrEqualTo(root.get("price"), max);
            }
            return null;
        };
    }

    public static Specification<Expense> dateBetween(LocalDate start, LocalDate end) {
        return (root, query, cb) -> {
            if (start != null && end != null) {
                return cb.between(root.get("expenseDate"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("expenseDate"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(root.get("expenseDate"), end);
            }
            return null;
        };
    }
}
