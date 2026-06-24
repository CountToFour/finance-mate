package finance_mate.auth.service;

import finance_mate.auth.model.dto.LoginRequestDto;
import finance_mate.auth.model.dto.LogoutRequestDto;
import finance_mate.auth.model.dto.RefreshTokenRequestDto;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserRegistrationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardAuthService implements AuthService {

    private final KeycloakUserService keycloakUserService;

    @Override
    public void register(UserRegistrationDto patientDto) {
        keycloakUserService.createUserInKeycloak(patientDto.getEmail(), patientDto.getPassword(), patientDto.getFirstName(), patientDto.getLastName());
    }

    @Override
    public TokenResponseDto login(LoginRequestDto loginRequest) {
        return keycloakUserService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @Override
    public void logout(LogoutRequestDto logoutRequestDto) {
        keycloakUserService.logout(logoutRequestDto.getRefreshToken());
    }
    
    @Override
    public TokenResponseDto refresh(RefreshTokenRequestDto refreshTokenRequestDto) {
        return keycloakUserService.refreshAccessToken(refreshTokenRequestDto.getRefreshToken());
    }
}
