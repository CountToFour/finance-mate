package com.financemate.auth.service;

import com.financemate.account.exception.UserNotFoundException;
import com.financemate.account.service.CurrencyService;
import com.financemate.auth.model.user.User;
import com.financemate.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CurrencyService currencyService;

    public User changeUserCurrency(String code, String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setMainCurrency(currencyService.getCurrencyByCode(code));
        return userRepository.save(user);
    }

    public User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

}
