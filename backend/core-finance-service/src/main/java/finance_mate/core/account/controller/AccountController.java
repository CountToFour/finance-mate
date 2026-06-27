package finance_mate.core.account.controller;


import finance_mate.core.account.model.dto.AccountDto;
import finance_mate.core.account.model.dto.BalanceResponse;
import finance_mate.core.account.model.dto.TransferDto;
import finance_mate.core.account.exception.*;
import finance_mate.core.account.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<?> getAccountsForUser(@RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(accountService.getAccountForUser(userId));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAccount(@Valid @RequestBody AccountDto dto,
                                           @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(accountService.createAccount(dto, userId));
        } catch (UserNotFoundException | CurrencyNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/update/{accountId}")
    public ResponseEntity<?> updateAccount(@PathVariable String accountId,
                                           @RequestBody AccountDto dto,
                                           @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(accountService.updateAccount(accountId, dto, userId));
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalOperationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete/{accountId}")
    public ResponseEntity<?> deleteAccount(@PathVariable String accountId,
                                           @RequestHeader("X-User-Id") String userId) {
        try {
            accountService.deleteAccount(accountId, userId);
            return ResponseEntity.ok("Account deleted successfully");
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<?> getAccountById(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        try {
            return ResponseEntity.ok(accountService.getAccountById(accountId, userId));
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/archive/{accountId}")
    public ResponseEntity<?> archiveAccount(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        try {
            accountService.archiveAccount(accountId, userId);
            return ResponseEntity.ok("Account archived successfully");
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/include-in-stats/{accountId}")
    public ResponseEntity<?> includeInStats(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        try {
            accountService.includeInStats(accountId, userId);
            return ResponseEntity.ok("Account includeInStats toggled successfully");
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/transfer")
    public ResponseEntity<?> transferBetweenAccounts(@RequestBody TransferDto request,
                                                     @RequestHeader("X-User-Id") String userId) {
        try {
            accountService.transferBetweenAccounts(request.fromAccountId(), request.toAccountId(), request.amount(), userId);
            return ResponseEntity.ok("Transfer completed successfully");
        } catch (AccountNotFoundException | UserNotFoundException | CurrencyNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getUserBalance(@RequestHeader("X-User-Id") String userId) {
        try {
            BalanceResponse balance = accountService.getUserBalance(userId);
            return ResponseEntity.ok(balance);
        } catch (UserNotFoundException | CurrencyNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

}
