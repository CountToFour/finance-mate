package com.financemate.account.controller;

import com.financemate.account.dto.AccountDto;
import com.financemate.account.service.AccountService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account")
@CrossOrigin("*")
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getAccountForUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(accountService.getAccountForUser(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createAccount(@Valid @RequestBody AccountDto dto,
                                           @PathVariable String userId) {
        try {
            return ResponseEntity.ok(accountService.createAccount(dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/update/{accountId}/{userId}")
    public ResponseEntity<?> updateAccount(@PathVariable String accountId,
                                           @RequestBody AccountDto dto,
                                           @PathVariable String userId) {
        try {
            return ResponseEntity.ok(accountService.updateAccount(accountId, dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/delete/{accountId}/{userId}")
    public ResponseEntity<?> deleteAccount(@PathVariable String accountId,
                                           @PathVariable String userId) {
        try {
            accountService.deleteAccount(accountId, userId);
            return ResponseEntity.ok("Account deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/{accountId}/{userId}")
    public ResponseEntity<?> getAccountById(@PathVariable String accountId,
                                            @PathVariable String userId) {
        try {
            return ResponseEntity.ok(accountService.getAccountById(accountId, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/archive/{accountId}/{userId}")
    public ResponseEntity<?> archiveAccount(@PathVariable String accountId,
                                            @PathVariable String userId) {
        try {
            accountService.archiveAccount(accountId, userId);
            return ResponseEntity.ok("Account archived successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/include-in-stats/{accountId}/{userId}")
    public ResponseEntity<?> includeInStats(@PathVariable String accountId,
                                            @PathVariable String userId) {
        try {
            accountService.includeInStats(accountId, userId);
            return ResponseEntity.ok("Account includeInStats toggled successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

}
