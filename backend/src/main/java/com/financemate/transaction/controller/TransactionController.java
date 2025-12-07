package com.financemate.transaction.controller;

import com.financemate.auth.model.user.User;
import com.financemate.auth.service.UserService;
import com.financemate.transaction.dto.CategoryDto;
import com.financemate.transaction.dto.DailyOverviewDto;
import com.financemate.transaction.dto.EditTransactionDto;
import com.financemate.transaction.dto.MonthOverviewDto;
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
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
    @Transactional
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

    @GetMapping
    public ResponseEntity<?> getTransactionsByUser(
            @RequestParam TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String accountName,
            Authentication authentication) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getTransactionsByUser(user, category, minPrice, maxPrice,
                    startDate, endDate, type, accountName));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @GetMapping("/recurring")
    public ResponseEntity<?> getAllRecurringTransactions(Authentication authentication,
                                                         @RequestParam TransactionType type) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getAllRecurringTransactions(user, type));
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

    @GetMapping("/categories/type/{type}")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesAmount(Authentication authentication,
                                                                    @PathVariable TransactionType type,
                                                                    @RequestParam(required = false) LocalDate startDate,
                                                                    @RequestParam(required = false) LocalDate endDate) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getAllCategoriesAmount(user, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/type/{type}")
    public ResponseEntity<?> getTransactionOverview(Authentication authentication,
                                                    @PathVariable TransactionType type,
                                                    @RequestParam(required = false) LocalDate startDate,
                                                    @RequestParam(required = false) LocalDate endDate) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getTransactionOverview(user, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/monthly")
    public ResponseEntity<List<MonthOverviewDto>> getMonthlyOverview(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getMonthlyOverview(user, startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("overview/top")
    public ResponseEntity<?> getTopExpenses(Authentication authentication,
                                            @RequestParam(required = false) LocalDate startDate,
                                            @RequestParam(required = false) LocalDate endDate,
                                            @RequestParam(defaultValue = "5") int limit,
                                            @RequestParam TransactionType type) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getTopTransactionsByAmount(user, startDate, endDate, limit, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/daily")
    public ResponseEntity<List<DailyOverviewDto>> getDailyOverview(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam TransactionType type) {
        try {
            User user = userService.getUserFromAuthentication(authentication);
            return ResponseEntity.ok(transactionService.getDailyOverview(user, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
