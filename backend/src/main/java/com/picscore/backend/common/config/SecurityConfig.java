package com.picscore.backend.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.common.handler.CustomSuccessHandler;
import com.picscore.backend.common.jwt.CustomLogoutFilter;
import com.picscore.backend.common.jwt.JWTFilter;
import com.picscore.backend.common.jwt.JWTUtil;
import com.picscore.backend.user.repository.UserRepository;
import com.picscore.backend.user.service.CustomOAuth2UserService;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuthUserService;
    private final CustomSuccessHandler customSuccessHandler;
    private final JWTUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final UserRepository userRepository;
    private final OAuthService oAuthService;
    private final ObjectMapper objectMapper;

    /**
     * Spring Security 필터 체인을 구성합니다.
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 보안 구성 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CORS 설정
                .cors(corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {

                    @Override
                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {

                        CorsConfiguration configuration = new CorsConfiguration();


                        configuration.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "https://j12b104.p.ssafy.io",
                                "https://picscore.net"
                        ));
                        configuration.setAllowedMethods(Collections.singletonList("*"));
                        configuration.setAllowCredentials(true);
                        configuration.setAllowedHeaders(Collections.singletonList("*"));
                        configuration.setMaxAge(3600L);

                        configuration.setExposedHeaders(List.of("Set-Cookie", "Authorization"));


                        return configuration;
                    }
                }));

        // CSRF 보호 비활성화
        http
                .csrf((auth) -> auth.disable());

        // Form 로그인 방식 비활성화
        http
                .formLogin((auth) -> auth.disable());

        // HTTP Basic 인증 방식 비활성화
        http
                .httpBasic((auth) -> auth.disable());

        // JWT 필터 추가
        http
                .addFilterAfter(new JWTFilter(jwtUtil, oAuthService, objectMapper), OAuth2LoginAuthenticationFilter.class);

        http
                .addFilterBefore(new CustomLogoutFilter(jwtUtil, redisUtil, userRepository), LogoutFilter.class);

        // OAuth2 로그인 설정
        http
                .oauth2Login((oauth2) -> oauth2
                        .userInfoEndpoint((userInfoEndpointConfig) -> userInfoEndpointConfig
                                .userService(customOAuthUserService))
                        .successHandler(customSuccessHandler)
                );

        // URL 별 접근 권한 설정
        http
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/", "/api/v1/photo", "/api/v1/image/analyze").permitAll()
                        .requestMatchers("/api/v1/user/{type}").permitAll()
                        .requestMatchers("/api/v1/user/photo/{userId}").permitAll()
                        .requestMatchers("/api/v1/photo/{photoId}").permitAll()
                        .anyRequest().authenticated());

        // 세션 관리 정책 설정
        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}

