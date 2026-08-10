package finance_mate.auth.service;

import finance_mate.auth.model.dto.LoginRequestDto;
import finance_mate.auth.model.dto.LogoutRequestDto;
import finance_mate.auth.model.dto.RefreshTokenRequestDto;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserRegistrationDto;

public interface AuthService {
    void register(UserRegistrationDto userDto);

    TokenResponseDto login(LoginRequestDto loginRequest);

    void logout(String refreshToken);

    TokenResponseDto refresh(RefreshTokenRequestDto refreshTokenRequestDto);

}
