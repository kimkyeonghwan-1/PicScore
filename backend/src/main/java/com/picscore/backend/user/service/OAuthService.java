package com.picscore.backend.user.service;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.user.jwt.JWTUtil;
import com.picscore.backend.user.model.response.ReissueResponse;
import com.picscore.backend.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<BaseResponse<ReissueResponse>> reissue(HttpServletRequest request, HttpServletResponse response) {

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

        if (refresh == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error("RefreshToken 쿠키 없음"));
        }

        // 리프레시 토큰 만료 여부 확인
        try {
            jwtUtil.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error("유효하지 않은 토큰"));
        }

        // 토큰 유형 확인
        if (!"refresh".equals(jwtUtil.getCategory(refresh))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error("RefreshToken이 아님"));
        }

        // 닉네임 및 Redis 키 생성
        String nickName = jwtUtil.getNickName(refresh);
        String userKey = "refresh:" + userRepository.findIdByNickName(nickName);

        // Redis에 저장된 리프레시 토큰 존재 여부 확인
        Boolean isExist = redisUtil.exists(userKey);
        if (!isExist) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error("Redis에 존재하지 않음"));
        }

        // Redis에 저장된 리프레시 토큰 동일 여부 확인
        Object storedRefreshTokenObj = redisUtil.get(userKey);
        String storedRefreshToken = storedRefreshTokenObj.toString();
        if (!storedRefreshToken.equals(refresh)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(BaseResponse.error("Redis의 값과 다름"));
        }

        // 새로운 액세스 및 리프레시 토큰 생성
        String newAccess = jwtUtil.createJwt("access", nickName, 600000L); // 10분 유효
        String newRefresh = jwtUtil.createJwt("refresh", nickName, 86400000L); // 1일 유효

        // Redis에 새 리프레시 토큰 저장
        redisUtil.setex(userKey, newRefresh, 86400000L);

        // 클라이언트에 새 토큰 쿠키로 설정
        response.addCookie(createCookie("access", newAccess));
        response.addCookie(createCookie("refresh", newRefresh));

        ReissueResponse data = new ReissueResponse(newAccess);

        return ResponseEntity.ok(BaseResponse.success("토큰 재발급 성공", data));
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
        cookie.setMaxAge(60 * 60 * 60 * 60); // 쿠키 유효 기간 설정 (초 단위)
        //cookie.setSecure(true); // HTTPS 환경에서만 전송 (주석 처리 상태)
        cookie.setPath("/"); // 모든 경로에서 쿠키 접근 가능
        cookie.setHttpOnly(true); // JavaScript에서 접근 불가 (보안 강화)

        return cookie;
    }
}

