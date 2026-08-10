package finance_mate.auth.controller;

import finance_mate.auth.model.dto.LoginRequestDto;
import finance_mate.auth.model.dto.RefreshTokenRequestDto;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserRegistrationDto;
import finance_mate.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
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
    public ResponseEntity<Void> register(@Valid @RequestBody UserRegistrationDto patientDto) {
        authService.register(patientDto);
        TokenResponseDto tokens = authService.login(new LoginRequestDto(patientDto.getEmail(), patientDto.getPassword()));
        return buildResponseWithCookies(tokens, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody LoginRequestDto dto) {
        TokenResponseDto tokens = authService.login(dto);
        return buildResponseWithCookies(tokens, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refresh_token") String refreshToken) {
        ResponseCookie jwtCookie = clearCookie("access_token", "/");
        ResponseCookie refreshCookie = clearCookie("refresh_token", "/api/auth/refresh");

        authService.logout(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken(@CookieValue(name = "refresh_token") String refreshToken) {
        TokenResponseDto newTokens = authService.refresh(new RefreshTokenRequestDto(refreshToken));
        return buildResponseWithCookies(newTokens, HttpStatus.OK);
    }

    private ResponseEntity<Void> buildResponseWithCookies(TokenResponseDto tokens, HttpStatus status) {
        boolean isSecure = false;

        ResponseCookie jwtCookie = ResponseCookie.from("access_token", tokens.getAccessToken())
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(15 * 60)
                .sameSite("Strict")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    private ResponseCookie clearCookie(String name, String path) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(false)
                .path(path)
                .maxAge(0)
                .sameSite("Strict")
                .build();
    }
}