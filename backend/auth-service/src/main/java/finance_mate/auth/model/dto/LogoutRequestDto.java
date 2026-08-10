package finance_mate.auth.model.dto;

import lombok.Data;

@Data
public class LogoutRequestDto {
    private String refreshToken;
}
