package com.picscore.backend.common.handler;

import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.common.jwt.JWTUtil;
import com.picscore.backend.user.model.dto.CustomOAuth2User;
import com.picscore.backend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    private final JWTUtil jwtUtil;
    private final RedisUtil redisUtil;

    @Value("${LOGIN_SUCCESS}")
    private String successURL;

    @Value("${FIRST_USER}")
    private String agreementURL;

    @Value("${JWT_ACCESS_EXP}")
    private String jwtAccessExp;

    @Value("${JWT_REFRESH_EXP}")
    private String jwtRefreshExp;

    @Value("${JWT_REDIS_EXP}")
    private String jwtRedisExp;


    /**
     * OAuth2 인증 성공 시 호출됩니다.
     * JWT 토큰을 생성하고 Redis에 Refresh 토큰을 저장한 후, 클라이언트에 쿠키를 설정합니다.
     *
     * @param request HTTP 요청 객체
     * @param response HTTP 응답 객체
     * @param authentication 인증 객체 (OAuth2User 정보 포함)
     * @throws IOException 입출력 예외 발생 시
     * @throws ServletException 서블릿 예외 발생 시
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        // OAuth2User 정보 가져오기
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();

        String socialId = customUserDetails.getSocialId();
        String nickName = userRepository.findNickNameBySocialId(socialId);

        // 기기 정보 가져오기
        String userAgent = request.getHeader("User-Agent").toLowerCase();
        String deviceType = getDeviceType(userAgent); // 기기 유형 판별
        
        // Access Token 및 Refresh Token 생성
        String access = jwtUtil.createJwt("access", nickName, Long.parseLong(jwtAccessExp)); // 10분 유효
        String refresh = jwtUtil.createJwt("refresh", nickName, Long.parseLong(jwtRefreshExp)); // 1일 유효

        // Redis에 Refresh Token 저장
        String userKey = "refresh:" + userRepository.findIdByNickName(nickName) + ":" + deviceType;
        redisUtil.setex(userKey, refresh, Long.parseLong(jwtRedisExp)); // 1일 TTL

        // 클라이언트에 Access Token 및 Refresh Token 쿠키로 설정
        response.addCookie(createCookie("access", access));
        response.addCookie(createCookie("refresh", refresh));

         //인증 성공 후 리다이렉트
        boolean firstUser = customUserDetails.getFistUser();
        if (firstUser) {
            response.sendRedirect(agreementURL);
        } else {
            response.sendRedirect(successURL);
        }
    }


    /**
     * 쿠키를 생성합니다.
     *
     * @param key 쿠키 이름
     * @param value 쿠키 값
     * @return 생성된 Cookie 객체
     */
    private Cookie createCookie(
            String key, String value) {

        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60 * 60 * 24); // 1일 유지
        cookie.setSecure(true); // HTTPS에서만 전송 (배포 환경에서는 필수)
        cookie.setHttpOnly(true); // JavaScript에서 접근 불가
        cookie.setPath("/"); // 모든 경로에서 접근 가능
    
        return cookie;
    }


    /**
     * User-Agent를 분석하여 기기 유형을 판별합니다.
     *
     * @param userAgent HTTP User-Agent 헤더 값
     * @return "pc" 또는 "mobile"
     */
    private String getDeviceType(
            String userAgent) {

        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "mobile";
        }

        return "pc";
    }
}

