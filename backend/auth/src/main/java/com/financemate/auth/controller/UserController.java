package com.financemate.auth.controller;

import com.financemate.auth.controller.dto.RegistrationDto;
import com.financemate.auth.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDto req) {
        userService.register(req.username(), req.email(), req.password());
        log.info("User {} registered successfully", req.username());
        return ResponseEntity.ok("registered");
    }
}
