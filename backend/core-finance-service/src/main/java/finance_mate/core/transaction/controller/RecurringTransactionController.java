package finance_mate.core.transaction.controller;

import finance_mate.core.transaction.model.TransactionType;
import finance_mate.core.transaction.model.dto.EditTransactionDto;
import finance_mate.core.transaction.model.dto.RecurringTransactionResponse;
import finance_mate.core.transaction.model.dto.TransactionRequest;
import finance_mate.core.transaction.service.StandardRecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions/recurring")
public class RecurringTransactionController {

    private final StandardRecurringTransactionService standardRecurringTransactionService;

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> addRecurringTransaction(@Valid @RequestBody TransactionRequest transaction,
                                                                                @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(standardRecurringTransactionService.addRecurringTransaction(transaction, userId));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getAllRecurringTransactions(@RequestHeader("X-User-Id") String userId,
                                                                                          @RequestParam TransactionType type) {
        return ResponseEntity.ok(standardRecurringTransactionService.getAllRecurringTransactions(userId, type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecurringTransaction(@PathVariable String id) {
        standardRecurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateRecurringTransaction(@PathVariable String id) {
        standardRecurringTransactionService.deactivateRecurringTransaction(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> editTransaction(@PathVariable String id, @Valid @RequestBody EditTransactionDto transactionRequest) {
        RecurringTransactionResponse updatedRecurring = standardRecurringTransactionService.editRecurringTransaction(id, transactionRequest);
        return ResponseEntity.ok(updatedRecurring);
    }

}
