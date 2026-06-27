package finance_mate.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Component
public class UserIdHeaderFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        return ReactiveSecurityContextHolder.getContext()
                .filter(context -> context.getAuthentication() != null)
                .mapNotNull(context -> Objects.requireNonNull(context.getAuthentication()).getPrincipal())
                .cast(Jwt.class)
                .map(jwt -> {
                    String userId = jwt.getClaimAsString("sub");

                    var mutatedRequest = exchange.getRequest().mutate()
                            .header("X-User-Id", userId)
                            .build();

                    return exchange.mutate().request(mutatedRequest).build();
                })
                .defaultIfEmpty(exchange)
                .flatMap(chain::filter);
    }
}
