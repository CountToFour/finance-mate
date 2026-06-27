package finance_mate.core.transaction.controller;

import finance_mate.core.transaction.exception.AccountNotFoundException;
import finance_mate.core.transaction.exception.InvalidPeriodTypeException;
import finance_mate.core.transaction.exception.TransactionNotFoundException;
import finance_mate.core.transaction.exception.UserNotFoundException;
import finance_mate.core.transaction.model.PeriodType;
import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.*;
import finance_mate.core.transaction.service.TransactionService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Transactional
    public ResponseEntity<?> addTransaction(@Valid @RequestBody TransactionRequest transaction,
                                            @RequestHeader("X-User-Id") String userId) {
        try {
            TransactionResponse saved = transactionService.addTransaction(transaction, userId);
            return ResponseEntity.ok(saved);
        } catch (UserNotFoundException | AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PostMapping("/recurring")
    public ResponseEntity<?> addRecurringTransaction(@Valid @RequestBody TransactionRequest transaction,
                                                     @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(transactionService.addRecurringTransaction(transaction, userId));
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
            @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionsByUser(userId, category, minPrice, maxPrice,
                    startDate, endDate, type, accountName));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @GetMapping("/recurring")
    public ResponseEntity<?> getAllRecurringTransactions(@RequestHeader("X-User-Id") String userId,
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

    @GetMapping("/categories/type/{type}")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesAmount(@RequestHeader("X-User-Id") String userId,
                                                                    @PathVariable TransactionType type,
                                                                    @RequestParam(required = false) LocalDate startDate,
                                                                    @RequestParam(required = false) LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getAllCategoriesAmount(userId, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/type/{type}")
    public ResponseEntity<?> getTransactionOverview(@RequestHeader("X-User-Id") String userId,
                                                    @PathVariable TransactionType type,
                                                    @RequestParam(required = false) LocalDate startDate,
                                                    @RequestParam(required = false) LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionOverview(userId, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/monthly")
    public ResponseEntity<List<MonthOverviewDto>> getMonthlyOverview(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            return ResponseEntity.ok(transactionService.getMonthlyOverview(userId, startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("overview/top")
    public ResponseEntity<?> getTopExpenses(@RequestHeader("X-User-Id") String userId,
                                            @RequestParam(required = false) LocalDate startDate,
                                            @RequestParam(required = false) LocalDate endDate,
                                            @RequestParam(defaultValue = "5") int limit,
                                            @RequestParam TransactionType type) {
        try {
            return ResponseEntity.ok(transactionService.getTopTransactionsByAmount(userId, startDate, endDate, limit, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/overview/daily")
    public ResponseEntity<List<DailyOverviewDto>> getDailyOverview(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam TransactionType type) {
        try {
            return ResponseEntity.ok(transactionService.getDailyOverview(userId, startDate, endDate, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
