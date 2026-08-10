package finance_mate.auth.service;

import finance_mate.auth.model.dto.LoginRequestDto;
import finance_mate.auth.model.dto.LogoutRequestDto;
import finance_mate.auth.model.dto.RefreshTokenRequestDto;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserRegistrationDto;
import finance_mate.auth.publisher.RabbitMQPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardAuthService implements AuthService {

    private final KeycloakUserService keycloakUserService;
    private final RabbitMQPublisher rabbitMQPublisher;

    @Override
    public void register(UserRegistrationDto patientDto) {
        String userId = keycloakUserService.createUserInKeycloak(patientDto.getEmail(), patientDto.getPassword(), patientDto.getFirstName(), patientDto.getLastName());
        rabbitMQPublisher.assignDefaultCategories(userId);
    }

    @Override
    public TokenResponseDto login(LoginRequestDto loginRequest) {
        return keycloakUserService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @Override
    public void logout(String refreshToken) {
        keycloakUserService.logout(refreshToken);
    }
    
    @Override
    public TokenResponseDto refresh(RefreshTokenRequestDto refreshTokenRequestDto) {
        return keycloakUserService.refreshAccessToken(refreshTokenRequestDto.getRefreshToken());
    }
}
