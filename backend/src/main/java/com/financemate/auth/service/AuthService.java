package com.financemate.auth.service;

import com.financemate.account.model.Currency;
import com.financemate.account.service.CurrencyService;
import com.financemate.auth.dto.AuthResponse;
import com.financemate.auth.dto.LoginRequest;
import com.financemate.auth.dto.RegisterRequest;
import com.financemate.auth.exceptions.EmailAlreadyExistsException;
import com.financemate.auth.jwt.JwtService;
import com.financemate.auth.model.token.Token;
import com.financemate.auth.model.user.Role;
import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.TokenRepository;
import com.financemate.auth.repository.UserRepository;
import com.financemate.category.model.Category;
import com.financemate.category.model.CategoryLocale;
import com.financemate.category.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CurrencyService currencyService;
    private final CategoryRepository categoryRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already in use");
        }
        User user = User.builder()
                .email(request.email())
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .locale("pl")
                .mainCurrency(currencyService.getCurrencyByCode("PLN"))
                .build();
        assignDefaultCategoriesToUser(user);
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = (User) loadUserByUsername(request.email());
        // unieważnij stare refresh tokeny użytkownika
        tokenRepository.deleteByUserId(user.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = (User) loadUserByUsername(email);

        boolean valid = jwtService.isTokenValid(refreshToken, user)
                && tokenRepository.findByToken(refreshToken)
                .map(t -> !t.isExpired() && !t.isRevoked()).orElse(false);

        if (!valid) throw new IllegalArgumentException("Invalid refresh token");

        // rotacja refresh tokenu
        tokenRepository.deleteByUserId(user.getId());
        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user, Map.of(
                "role", user.getRole().name()
        ));
        String refresh = jwtService.generateRefreshToken(user);

        tokenRepository.save(Token.builder()
                .token(refresh)
                .user(user)
                .expired(false)
                .revoked(false)
                .build());

        return new AuthResponse(access, refresh, user.getUsername(), user.getEmail(), user.getId(), user.getLocale(), new Currency(user.getMainCurrency().getCode(), user.getMainCurrency().getName(), user.getMainCurrency().getSymbol()));
    }

    public void assignDefaultCategoriesToUser(User user) {
        CategoryLocale userLocale = user.getLocale().equals("pl") ? CategoryLocale.PL : CategoryLocale.EN;
        List<Category> defaultCategories = categoryRepository.findByIsDefaultTrueAndLocale(userLocale);

        for (Category defaultCategory : defaultCategories) {
            Category userCategory = Category.builder()
                    .name(defaultCategory.getName())
                    .color(defaultCategory.getColor())
                    .transactionType(defaultCategory.getTransactionType())
                    .categoryGroup(defaultCategory.getCategoryGroup())
                    .isDefault(false)
                    .user(user)
                    .locale(userLocale)
                    .build();
            categoryRepository.save(userCategory);
        }
    }
}
