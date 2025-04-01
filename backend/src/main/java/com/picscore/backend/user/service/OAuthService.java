package com.picscore.backend.user.service;

import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.common.jwt.JWTUtil;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthService {

    private final JWTUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final UserRepository userRepository;


    /**
     * 리프레시 토큰을 검증하고 새로운 액세스 및 리프레시 토큰을 발급합니다.
     *
     * @param request HTTP 요청 객체
     * @param response HTTP 응답 객체
     * @return ResponseEntity 객체로 결과 반환
     */
    public String reissue(HttpServletRequest request, HttpServletResponse response) {

        // 쿠키에서 리프레시 토큰 추출
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh".equals(cookie.getName())) {
                    refresh = cookie.getValue();
                }
            }
        }
//        String cookieHeader = request.getHeader("Cookie");
//        if (cookieHeader != null) {
//            String[] cookies = cookieHeader.split(";");
//            for (String cookie : cookies) {
//                if (cookie.trim().startsWith("refresh=")) {
//                    refresh = cookie.substring(cookie.indexOf('=') + 1);
//                    break;
//                }
//            }
//        }

        if (refresh == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "RefreshToken 쿠키 없음");
        }

        // 리프레시 토큰 만료 여부 확인
        if (jwtUtil.isExpired(refresh)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰");
        }

        // 토큰 유형 확인
        if (!"refresh".equals(jwtUtil.getCategory(refresh))) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "RefreshToken이 아님");
        }

        // 닉네임 및 Redis 키 생성
        String nickName = jwtUtil.getNickName(refresh);
        String userKey = "refresh:" + userRepository.findIdByNickName(nickName);

        // Redis에 저장된 리프레시 토큰 존재 여부 확인
        Boolean isExist = redisUtil.exists(userKey);
        if (!isExist) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Redis에 존재하지 않음");
        }

        // Redis에 저장된 리프레시 토큰 동일 여부 확인
        Object storedRefreshTokenObj = redisUtil.get(userKey);
        String storedRefreshToken = storedRefreshTokenObj.toString();
        if (!storedRefreshToken.equals(refresh)) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Redis의 값과 다름");
        }

        // 새로운 액세스 및 리프레시 토큰 생성
        String newAccess = jwtUtil.createJwt("access", nickName, 600000L); // 10분 유효
        String newRefresh = jwtUtil.createJwt("refresh", nickName, 86400000L); // 1일 유효

        // Redis에 새 리프레시 토큰 저장
        redisUtil.setex(userKey, newRefresh, 86400000L);

        // 클라이언트에 새 토큰 쿠키로 설정
        response.addCookie(createCookie("access", newAccess));
        response.addCookie(createCookie("refresh", newRefresh));

        return newAccess;
    }


    /**
     * 현재 로그인한 사용자의 ID를 닉네임을 통해 조회하는 메서드
     *
     * @param request HTTP 요청 객체 (쿠키에서 AccessToken 추출)
     * @return Long 사용자 ID
     */
    public Long findIdByNickName(HttpServletRequest request) {
        // 쿠키에서 AccessToken 추출
        String access = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access".equals(cookie.getName())) {
                    access = cookie.getValue();
                    break; // AccessToken을 찾았으므로 루프 종료
                }
            }
        }

        // 개발 환경 임시 방편
//        String authorizationHeader = request.getHeader("Authorization");
//        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
//            access = authorizationHeader.substring(7); // "Bearer " 이후의 토큰을 추출
//        }

        // JWT에서 닉네임 추출
        String nickName = jwtUtil.getNickName(access);
        // 닉네임으로 사용자 ID 조회
        Long userId = userRepository.findIdByNickName(nickName);

        return userId;
    }


    /**
     * 사용자 계정을 삭제하는 메서드
     *
     * @param userId 삭제할 사용자의 ID
     * @param response HTTP 응답 객체 (쿠키 삭제에 사용)
     * @return ResponseEntity<BaseResponse<Void>> 삭제 결과를 포함한 응답
     */
    public void deleteUser(
            Long userId, HttpServletResponse response) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다. 사용자 ID: " + userId));

        userRepository.delete(user);

        // Redis에서 Refresh Token 삭제
        String userKey = "refresh:" + userId;
        redisUtil.delete(userKey);

        // 쿠키에서 Access Token과 Refresh Token 삭제
        deleteCookie(response, "access");
        deleteCookie(response, "refresh");
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


    /**
     * 특정 이름의 쿠키를 삭제하는 헬퍼 메서드
     *
     * @param response HTTP 응답 객체
     * @param cookieName 삭제할 쿠키의 이름
     */
    private void deleteCookie(HttpServletResponse response, String cookieName) {
        Cookie cookie = new Cookie(cookieName, null); // 쿠키 값을 null로 설정
        cookie.setMaxAge(0); // 쿠키 만료 시간을 0으로 설정 (즉시 삭제)
        cookie.setPath("/"); // 쿠키 경로를 루트로 설정 (애플리케이션 전체에 적용)
        response.addCookie(cookie); // 응답에 삭제할 쿠키 추가
    }
}

