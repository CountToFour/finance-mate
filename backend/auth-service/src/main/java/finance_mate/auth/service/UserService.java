package finance_mate.auth.service;

import finance_mate.auth.model.User;
import finance_mate.auth.model.dto.UserDto;

public interface UserService {
    User createUser(String id, String name, String surname, String email);

    UserDto getUser(String id);
}
