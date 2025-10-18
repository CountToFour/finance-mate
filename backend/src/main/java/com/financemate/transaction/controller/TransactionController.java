package com.financemate.transaction.controller;

import com.financemate.auth.model.user.User;
import com.financemate.auth.service.UserService;
import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.EditTransactionDto;
import com.financemate.transaction.dto.RecurringTransactionResponse;
import com.financemate.transaction.dto.TransactionRequest;
import com.financemate.transaction.dto.TransactionResponse;
import com.financemate.transaction.exception.AccountNotFoundException;
import com.financemate.transaction.exception.InvalidPeriodTypeException;
import com.financemate.transaction.exception.TransactionNotFoundException;
import com.financemate.transaction.exception.UserNotFoundException;
import com.financemate.transaction.model.PeriodType;
import com.financemate.transaction.model.TransactionType;
import com.financemate.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> addTransaction(@Valid @RequestBody TransactionRequest transaction,
                                            Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            TransactionResponse saved = transactionService.addTransaction(transaction, user);
            return ResponseEntity.ok(saved);
        } catch (UserNotFoundException | AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<?> addRecurringTransaction(@Valid @RequestBody TransactionRequest transaction,
                                                     Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.addRecurringTransaction(transaction, user));
        } catch (UserNotFoundException | AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (InvalidPeriodTypeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getTransactionsByUser(
            @PathVariable String userId,
            @RequestParam TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String accountName) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionsByUser(userId, category, minPrice, maxPrice,
                    startDate, endDate, type, accountName));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @GetMapping("/recurring/{userId}")
    public ResponseEntity<?> getAllRecurringTransactions(@PathVariable String userId,
                                                         @RequestParam TransactionType type) {
        try {
            return ResponseEntity.ok(transactionService.getAllRecurringTransactions(userId, type));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.ok().build();
        } catch (TransactionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }

    }

    @DeleteMapping("/recurring/{id}")
    public ResponseEntity<?> deleteRecurringTransaction(@PathVariable String id) {
        try {
            transactionService.deleteRecurringTransaction(id);
            return ResponseEntity.ok().build();
        } catch (TransactionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateRecurringTransaction(@PathVariable String id) {
        try {
            transactionService.deactivateRecurringTransaction(id);
            return ResponseEntity.ok().build();
        } catch (TransactionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editTransaction(@PathVariable String id, @Valid @RequestBody EditTransactionDto transactionRequest) {
        try {
            if (transactionRequest.periodType() != PeriodType.NONE) {
                RecurringTransactionResponse updatedRecurring = transactionService.editRecurringTransaction(id, transactionRequest);
                return ResponseEntity.ok(updatedRecurring);
            } else {
                TransactionResponse updatedTransaction = transactionService.editTransaction(id, transactionRequest);
                return ResponseEntity.ok(updatedTransaction);
            }
        } catch (TransactionNotFoundException | AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
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
