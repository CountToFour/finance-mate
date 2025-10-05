package com.financemate.transaction.utils;

import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionSpecifications {
    public static Specification<Transaction> hasUserId(String userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Transaction> hasCategory(String category) {
        return (root, query, cb) ->
                category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Transaction> amountBetween(Double min, Double max) {
        return (root, query, cb) -> {
            if (min != null && max != null) {
                if (min > max) {
                    throw new IllegalArgumentException("Min value cannot be greater than max value");
                }
                return cb.between(root.get("price"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), min);
            } else if (max != null) {
                return cb.lessThanOrEqualTo(root.get("price"), max);
            }
            return null;
        };
    }

    public static Specification<Transaction> dateBetween(LocalDate start, LocalDate end) {
        return (root, query, cb) -> {
            if (start != null && end != null) {
                if (start.isAfter(end)) {
                    throw new IllegalArgumentException("Start date cannot be after end date");
                }
                return cb.between(root.get("createdAt"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(root.get("createdAt"), end);
            }
            return null;
        };
    }

    public static Specification<Transaction> type(TransactionType type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("transactionType"), type);
    }

    public static Specification<Transaction> accountName(String accountName) {
        return (root, query, cb) ->
                accountName == null ? null : cb.equal(root.get("account").get("name"), accountName);
    }
}
