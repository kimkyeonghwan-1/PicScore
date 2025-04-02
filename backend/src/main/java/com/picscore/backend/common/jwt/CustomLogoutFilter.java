package com.picscore.backend.common.jwt;

import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

/**
 * 로그아웃 요청을 처리하는 커스텀 필터
 * - Refresh 토큰 검증 및 Redis에서 삭제
 * - Refresh 토큰 쿠키 제거
 * - 로그아웃 성공 시 클라이언트를 리다이렉트
 */
@RequiredArgsConstructor
public class CustomLogoutFilter extends GenericFilterBean {

    private final JWTUtil jwtUtil; // JWT 관련 유틸리티 클래스
    private final RedisUtil redisUtil; // Redis 관련 유틸리티 클래스
    private final UserRepository userRepository; // 사용자 데이터베이스 접근 클래스

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // HttpServletRequest와 HttpServletResponse로 캐스팅 후 필터 실행
        doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {

        // 1. 로그아웃 요청 경로 및 HTTP 메서드 확인
        String requestUri = request.getRequestURI();
        if (!requestUri.matches("^\\/logout$")) { // 경로가 "/logout"이 아닌 경우 다음 필터로 전달
            filterChain.doFilter(request, response);
            return;
        }

        String requestMethod = request.getMethod();
        if (!requestMethod.equals("POST")) { // HTTP 메서드가 POST가 아닌 경우 다음 필터로 전달
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 쿠키에서 Refresh 토큰 추출
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) { // 쿠키 이름이 "refresh"인 경우 값 추출
                    refresh = cookie.getValue();
                }
            }
        }

        // Refresh 토큰이 없는 경우 400 Bad Request 반환
        if (refresh == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // 3. Refresh 토큰 만료 여부 확인
        try {
            jwtUtil.isExpired(refresh); // 만료된 경우 예외 발생
        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // 만료된 토큰에 대해 400 Bad Request 반환
            return;
        }

        // 4. Refresh 토큰 유형 확인 (JWT 페이로드에서 "category" 값 확인)
        String category = jwtUtil.getCategory(refresh);
        if (!category.equals("refresh")) { // "refresh" 유형이 아닌 경우 400 Bad Request 반환
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // 5. Redis에서 해당 사용자 키 조회 및 존재 여부 확인
        String nickName = jwtUtil.getNickName(refresh); // JWT 페이로드에서 닉네임 추출
        String userKey = "refresh:" + userRepository.findIdByNickName(nickName); // Redis 키 생성

        Boolean isExist = redisUtil.exists(userKey);
        if (!isExist) { // Redis에 해당 키가 없으면 400 Bad Request 반환
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // 6. 로그아웃 처리: Redis에서 Refresh 토큰 삭제 및 쿠키 제거
        redisUtil.delete(userKey); // Redis에서 Refresh 토큰 삭제

        // 7. 쿠키 삭제
        deleteCookie(response, "access");
        deleteCookie(response, "refresh");

        response.setStatus(HttpServletResponse.SC_OK); // 로그아웃 성공 상태 코드 설정
    }

    private void deleteCookie(HttpServletResponse response, String cookieName) {
        Cookie cookie = new Cookie(cookieName, null); // 값은 null로 설정
        cookie.setMaxAge(0); // 만료 시간 0으로 설정 (즉시 삭제)
        cookie.setPath("/"); // 쿠키의 경로 설정 (어플리케이션 전체에 적용)
        response.addCookie(cookie); // 응답에 쿠키 추가
    }
}
