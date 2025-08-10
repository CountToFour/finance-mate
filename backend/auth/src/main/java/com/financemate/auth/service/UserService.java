package com.financemate.auth.service;

import com.financemate.auth.repository.UserRepository;
import com.financemate.auth.model.User;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(String username, String email, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            log.error("Username {} already taken", username);
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            log.error("Email {} already taken", email);
            throw new IllegalArgumentException("Email already taken");
        }


        // Stwórz użytkownika z przypisaną rolą
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEnabled(true);

        userRepository.save(user); // Zapisywane automatycznie w `user_roles`
    }

}
