package finance_mate.auth.service;

import finance_mate.auth.exception.ErrorCode;
import finance_mate.auth.exception.UserException;
import finance_mate.auth.model.User;
import finance_mate.auth.model.dto.UserDto;
import finance_mate.auth.model.dto.UserUpdateDto;
import finance_mate.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StandardUserService implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserDto createUser(String id, String name, String surname, String email) {
        User user = User.builder()
                .id(id)
                .firstName(name)
                .lastName(surname)
                .email(email)
                .locale("PL")
                .build();

        return userToDto(userRepository.save(user));
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserException(ErrorCode.USER_NOT_FOUND));
        return userToDto(user);
    }

    @Override
    public UserDto updateUser(UserUpdateDto dto, String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserException(ErrorCode.USER_NOT_FOUND));

        if (!user.getFirstName().equals(dto.getFirstName())) {
            user.setFirstName(dto.getFirstName());
        }

        if (!user.getLastName().equals(dto.getLastName())) {
            user.setLastName(dto.getLastName());
        }

        if (!user.getEmail().equals(dto.getEmail())) {
            user.setEmail(dto.getEmail());
        }

        return (userToDto(userRepository.save(user)));
    }

    private UserDto userToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .locale(user.getLocale())
                .build();
    }
}
