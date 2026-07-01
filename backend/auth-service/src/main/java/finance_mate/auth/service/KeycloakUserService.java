package finance_mate.auth.service;

import finance_mate.auth.exception.AuthException;
import finance_mate.auth.exception.ErrorCode;
import finance_mate.auth.model.dto.TokenResponseDto;
import finance_mate.auth.model.dto.UserDto;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class KeycloakUserService {

    @Value("${keycloak.server-url}")
    private String serverUrl;
    @Value("${keycloak.realm}")
    private String realm;
    @Value("${keycloak.client-id}")
    private String clientId;
    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final UserService userService;
    private final RestTemplate restTemplate;

    private final String PUBLIC_CLIENT_ID = "finance-mate-api";

    private Keycloak getKeycloakClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .grantType("client_credentials")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .build();
    }

    public String createUserInKeycloak(String email, String password, String firstName, String lastName) {
        Keycloak keycloakClient = getKeycloakClient();
        List<UserRepresentation> existingUsers = keycloakClient.realm(realm)
                .users().searchByEmail(email, true);

        if (!existingUsers.isEmpty()) {
            throw new AuthException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        user.setCredentials(Collections.singletonList(credential));
        return register(user);
    }

    public TokenResponseDto login(String email, String password) {
        String tokenEndpoint = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", PUBLIC_CLIENT_ID);
        map.add("username", email);
        map.add("password", password);
        map.add("grant_type", "password");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            Map<String, Object> body = response.getBody();

            String accessToken = (String) body.get("access_token");
            String refreshToken = (String) body.get("refresh_token");

            return new TokenResponseDto(accessToken, refreshToken);

        } catch (AuthException e) {
            throw e;
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Brak dostępu")) {
                throw e;
            }
            throw new AuthException(ErrorCode.INCORRECT_CREDENTIALS);
        } catch (Exception e) {
            throw new AuthException(ErrorCode.INCORRECT_CREDENTIALS);
        }
    }

    public void logout(String refreshToken) {
        String logoutEndpoint = serverUrl + "/realms/" + realm + "/protocol/openid-connect/logout";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", PUBLIC_CLIENT_ID);
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            restTemplate.postForEntity(logoutEndpoint, request, String.class);
        } catch (Exception e) {
            throw new AuthException(ErrorCode.INTERVAL_SERVER_ERROR);
        }
    }

    private String register(UserRepresentation user) {
        Keycloak keycloakClient = getKeycloakClient();
        Response response = keycloakClient.realm(realm).users().create(user);
        if (response.getStatus() == 201) {
            String path = response.getLocation().getPath();
            String keycloakUserId = path.substring(path.lastIndexOf("/") + 1);

            try {
                UserDto userEntity = userService.createUser(keycloakUserId, user.getFirstName(), user.getLastName(), user.getEmail());
                log.info("Successfully created user in Keycloak and local DB with ID: {}", keycloakUserId);
                return userEntity.getId();
            } catch (Exception e) {
                try {
                    keycloakClient.realm(realm).users().get(keycloakUserId).remove();
                    log.info("Successfully rolled back (deleted) user in Keycloak.");
                } catch (Exception rollbackException) {
                    log.error("CRITICAL: Failed to rollback user in Keycloak! Manual intervention might be required for user ID: {}", keycloakUserId, rollbackException);
                }
                throw new AuthException(ErrorCode.INTERVAL_SERVER_ERROR);
            }
        } else {
            log.error("Error while creating user in Keycloak: {}", response.getStatusInfo().getReasonPhrase());
            throw new AuthException(ErrorCode.INTERVAL_SERVER_ERROR);
        }
    }

    public TokenResponseDto refreshAccessToken(String refreshToken) {
        String tokenEndpoint = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", PUBLIC_CLIENT_ID);
        map.add("grant_type", "refresh_token");
        map.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenEndpoint, request, Map.class);
            Map<String, Object> body = response.getBody();

            return new TokenResponseDto(
                    (String) body.get("access_token"),
                    (String) body.get("refresh_token")
            );
        } catch (Exception e) {
            throw new AuthException(ErrorCode.TOKEN_EXPIRED);
        }
    }
}
