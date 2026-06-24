package finance_mate.auth.controller;

import finance_mate.auth.model.dto.LoginRequestDto;
import finance_mate.auth.model.dto.LogoutRequestDto;
import finance_mate.auth.model.dto.RefreshTokenRequestDto;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserRegistrationDto;
import finance_mate.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<TokenResponseDto> register(@Valid @RequestBody UserRegistrationDto patientDto) {
        authService.register(patientDto);
        TokenResponseDto login = authService.login(new LoginRequestDto(patientDto.getEmail(), patientDto.getPassword()));
        return ResponseEntity.status(HttpStatus.CREATED).body(login);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@RequestBody LoginRequestDto dto) {
        TokenResponseDto tokens = authService.login(dto);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequestDto dto) {
        authService.logout(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refreshToken(@RequestBody RefreshTokenRequestDto dto) {
        TokenResponseDto newTokens = authService.refresh(dto);
        return ResponseEntity.ok(newTokens);
    }
}