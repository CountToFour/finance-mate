package com.financemate.transaction.controller;

import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.TransactionRequest;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.exception.AccountNotFoundException;
import com.financemate.transaction.exception.UserNotFoundException;
import com.financemate.transaction.model.Transaction;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.RecurringTransaction;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
@CrossOrigin("*")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<?> addTransaction(@Valid @RequestBody TransactionRequest transaction) {
        try {
            TransactionResponse saved = transactionService.addTransaction(transaction);
            return ResponseEntity.ok(saved);
        } catch (UserNotFoundException | AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<Void> addRecurringTransaction(@Valid @RequestBody TransactionRequest transaction) {
        try {
            transactionService.addRecurringTransaction(transaction);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/type/{type}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByUser(
            @PathVariable String userId,
            @PathVariable TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionsByUser(userId, category, minPrice, maxPrice, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recurring/{userId}/type/{type}")
    public ResponseEntity<List<TransactionRequest>> getAllRecurringTransactions(@PathVariable String userId,
                                                                                @PathVariable TransactionType type) {
        try {
            return ResponseEntity.ok(transactionService.getAllRecurringTransactions(userId, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/recurring/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable String id) {
        try {
            transactionService.deleteRecurringTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/deactivate/{id}")
    public ResponseEntity<Void> deactivateRecurringTransaction(@PathVariable String id) {
        try {
            transactionService.deactivateRecurringTransaction(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editTransaction(@PathVariable String id, @Valid @RequestBody TransactionRequest transactionRequest) {
        try {
            if (transactionRequest.getPeriodType() != PeriodType.NONE) {
                RecurringTransaction updatedRecurring = transactionService.editRecurringTransaction(id, transactionRequest);
                return ResponseEntity.ok(updatedRecurring);
            } else {
                Transaction updatedTransaction = transactionService.editTransaction(id, transactionRequest);
                return ResponseEntity.ok(updatedTransaction);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/categories/{userId}/type/{type}")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesAmount(@PathVariable String userId,
                                                                    @PathVariable TransactionType type,
                                                                    @RequestParam(required = false) LocalDate startDate,
                                                                    @RequestParam(required = false) LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getAllCategoriesAmount(userId, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/{userId}/type/{type}")
    public ResponseEntity<?> getTransactionOverview(@PathVariable String userId,
                                                @PathVariable TransactionType type,
                                                @RequestParam LocalDate startDate,
                                                @RequestParam LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionOverview(userId, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
