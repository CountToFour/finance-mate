package finance_mate.core.account.controller;


import finance_mate.core.account.model.dto.AccountDto;
import finance_mate.core.account.model.dto.AccountResponse;
import finance_mate.core.account.model.dto.BalanceResponse;
import finance_mate.core.account.model.dto.TransferDto;
import finance_mate.core.account.service.AccountService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccountsForUser(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(accountService.getAccountForUser(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountDto dto,
                                           @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(accountService.createAccount(dto, userId));
    }

    @PutMapping("/update/{accountId}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable String accountId,
                                           @Valid @RequestBody AccountDto dto,
                                           @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(accountService.updateAccount(accountId, dto, userId));
    }

    @DeleteMapping("/delete/{accountId}")
    public ResponseEntity<String> deleteAccount(@PathVariable String accountId,
                                           @RequestHeader("X-User-Id") String userId) {
        accountService.deleteAccount(accountId, userId);
        return ResponseEntity.ok("Account deleted successfully");
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(accountService.getAccountById(accountId, userId));
    }

    @PutMapping("/archive/{accountId}")
    public ResponseEntity<String> archiveAccount(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        accountService.archiveAccount(accountId, userId);
        return ResponseEntity.ok("Account archive status changed successfully");
    }

    @PutMapping("/include-in-stats/{accountId}")
    public ResponseEntity<String> includeInStats(@PathVariable String accountId,
                                            @RequestHeader("X-User-Id") String userId) {
        accountService.includeInStats(accountId, userId);
        return ResponseEntity.ok("Account include in statistics toggled successfully");
    }

    @PutMapping("/transfer")
    public ResponseEntity<String> transferBetweenAccounts(@Valid @RequestBody TransferDto request,
                                                     @RequestHeader("X-User-Id") String userId) {
        accountService.transferBetweenAccounts(request.fromAccountId(), request.toAccountId(), request.amount(), userId);
        return ResponseEntity.ok("Transfer completed successfully");
    }

    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getUserBalance(@RequestHeader("X-User-Id") String userId) {
        BalanceResponse balance = accountService.getUserBalance(userId);
        return ResponseEntity.ok(balance);
    }

}
