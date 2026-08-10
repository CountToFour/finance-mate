package finance_mate.auth.service;

import finance_mate.auth.model.dto.UserDto;
import finance_mate.auth.model.dto.UserUpdateDto;

public interface UserService {
    UserDto createUser(String id, String name, String surname, String email);

    UserDto getUserByEmail(String email);

    UserDto updateUser(UserUpdateDto dto, String id);
}
