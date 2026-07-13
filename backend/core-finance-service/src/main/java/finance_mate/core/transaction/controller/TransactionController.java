package finance_mate.core.transaction.controller;

import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.CategoryDto;
import finance_mate.core.transaction.model.dto.DailyOverviewDto;
import finance_mate.core.transaction.model.dto.EditTransactionDto;
import finance_mate.core.transaction.model.dto.MonthOverviewDto;
import finance_mate.core.transaction.model.dto.TransactionOverviewDto;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import finance_mate.core.transaction.model.dto.TransactionResponse;
import finance_mate.core.transaction.service.TransactionService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Transactional
    public ResponseEntity<TransactionResponse> addTransaction(@Valid @RequestBody TransactionRequest transaction,
                                            @RequestHeader("X-User-Id") String userId) {
        TransactionResponse saved = transactionService.addTransaction(transaction, userId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactionsByUser(
            @RequestParam TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String accountName,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUser(userId, category, minPrice, maxPrice,
                startDate, endDate, type, accountName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<TransactionResponse> editTransaction(@PathVariable String id, @Valid @RequestBody EditTransactionDto transactionRequest) {
        TransactionResponse updatedTransaction = transactionService.editTransaction(id, transactionRequest);
        return ResponseEntity.ok(updatedTransaction);
    }

    @GetMapping("/categories/type/{type}")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesAmount(@RequestHeader("X-User-Id") String userId,
                                                                    @PathVariable TransactionType type,
                                                                    @RequestParam(required = false) LocalDate startDate,
                                                                    @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getAllCategoriesAmount(userId, startDate, endDate, type));
    }

    @GetMapping("/overview/type/{type}")
    public ResponseEntity<TransactionOverviewDto> getTransactionOverview(@RequestHeader("X-User-Id") String userId,
                                                                         @PathVariable TransactionType type,
                                                                         @RequestParam(required = false) LocalDate startDate,
                                                                         @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getTransactionOverview(userId, startDate, endDate, type));
    }

    @GetMapping("/overview/monthly")
    public ResponseEntity<List<MonthOverviewDto>> getMonthlyOverview(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getMonthlyOverview(userId, startDate, endDate));

    }

    @GetMapping("overview/top")
    public ResponseEntity<List<TransactionResponse>> getTopExpenses(@RequestHeader("X-User-Id") String userId,
                                            @RequestParam(required = false) LocalDate startDate,
                                            @RequestParam(required = false) LocalDate endDate,
                                            @RequestParam(defaultValue = "5") int limit,
                                            @RequestParam TransactionType type) {
        return ResponseEntity.ok(transactionService.getTopTransactionsByAmount(userId, startDate, endDate, limit, type));

    }

    @GetMapping("/overview/daily")
    public ResponseEntity<List<DailyOverviewDto>> getDailyOverview(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam TransactionType type) {
        return ResponseEntity.ok(transactionService.getDailyOverview(userId, startDate, endDate, type));

    }
}
