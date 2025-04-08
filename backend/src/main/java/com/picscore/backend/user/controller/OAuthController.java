package com.picscore.backend.user.controller;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * OAuth 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oAuthService;


    /**
     * Google 로그인 페이지로 리다이렉트하는 엔드포인트
     *
     * @param response HTTP 응답 객체
     * @throws IOException 리다이렉트 중 발생할 수 있는 입출력 예외
     */
    @GetMapping("/user/{type}")
    public void redirectToGoogleLogin(
            @PathVariable String type, HttpServletResponse response) throws IOException {
        if (type.equals("google")) {
            response.sendRedirect("/oauth2/authorization/google");
        } else if (type.equals("kakao")) {
            response.sendRedirect("/oauth2/authorization/kakao");
        }
    }


    /**
     * 사용자 계정을 삭제하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (사용자 인증 정보 포함)
     * @param response HTTP 응답 객체
     * @return ResponseEntity<BaseResponse<Void>> 사용자 삭제 결과 응답
     */
    @DeleteMapping("/user")
    public ResponseEntity<BaseResponse<Void>> deleteUser(
            HttpServletRequest request, HttpServletResponse response) {

        Long userId = oAuthService.findIdByNickName(request);
        oAuthService.deleteUser(userId, request, response);

        return ResponseEntity.ok(BaseResponse.withMessage("회원탈퇴 완료"));
    }
}


