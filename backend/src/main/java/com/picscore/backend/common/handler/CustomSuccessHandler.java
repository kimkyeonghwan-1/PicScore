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

    private final JWTUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final UserRepository userRepository;

    @Value("${LOGIN_SUCCESS}")
    private String successURL;

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
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        // OAuth2User 정보 가져오기
        CustomOAuth2User customUserDetails = (CustomOAuth2User) authentication.getPrincipal();
        
        String socialId = customUserDetails.getSocialId();
        Boolean isExist = userRepository.existsBySocialId(socialId);
        
        String nickName = null;
        if (isExist) {
            nickName = userRepository.findNickNameBySocialId(socialId);
        } else {
            nickName = customUserDetails.getName();
        }
        
        // Access Token 및 Refresh Token 생성
        String access = jwtUtil.createJwt("access", nickName, 600000L); // 10분 유효
//        String access = jwtUtil.createJwt("access", nickName, 86400000L); // 1일 유효
        String refresh = jwtUtil.createJwt("refresh", nickName, 86400000L); // 1일 유효

        // Redis에 Refresh Token 저장
        String userKey = "refresh:" + userRepository.findIdByNickName(nickName);
        redisUtil.setex(userKey, refresh, 86400L); // 1일 TTL

        // 클라이언트에 Access Token 및 Refresh Token 쿠키로 설정
        response.addCookie(createCookie("access", access));
        response.addCookie(createCookie("refresh", refresh));

         //인증 성공 후 리다이렉트
        response.sendRedirect(successURL);
//        response.sendRedirect("https://picscore.net?loginSuccess=true");
//         response.sendRedirect("https://j12b104.p.ssafy.io?loginSuccess=true");
//        response.sendRedirect("http://localhost:5173?loginSuccess=true&access=" + access + "&refresh=" + refresh);
    }

    /**
     * 쿠키를 생성합니다.
     *
     * @param key 쿠키 이름
     * @param value 쿠키 값
     * @return 생성된 Cookie 객체
     */
    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60 * 60 * 24); // 1일 유지
//        cookie.setSecure(true); // HTTPS에서만 전송 (배포 환경에서는 필수)
        cookie.setHttpOnly(true); // JavaScript에서 접근 불가
        cookie.setPath("/"); // 모든 경로에서 접근 가능
    
        return cookie;
    }
}

