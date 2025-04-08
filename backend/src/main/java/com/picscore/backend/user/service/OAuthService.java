package com.picscore.backend.user.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 인증(OAuth) 관련 기능을 정의한 인터페이스입니다.
 * 구현체는 OAuthServiceImpl 입니다.
 */
public interface OAuthService {

    /**
     * 리프레시 토큰을 검증하고 새로운 액세스 및 리프레시 토큰을 발급합니다.
     */
    String reissue(HttpServletRequest request, HttpServletResponse response);

    /**
     * 현재 로그인한 사용자의 ID를 닉네임을 통해 조회하는 메서드
     */
    Long findIdByNickName(HttpServletRequest request);

    /**
     * 사용자 계정을 삭제하는 메서드
     */
    void deleteUser(Long userId, HttpServletRequest request, HttpServletResponse response);

}
