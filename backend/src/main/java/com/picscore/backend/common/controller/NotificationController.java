package com.picscore.backend.common.controller;

import com.picscore.backend.common.service.NotificationService;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("api/v1/sse")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final OAuthService oAuthService;


    /**
     * 클라이언트와 SSE 연결을 설정하는 엔드포인트
     *
     * @param request HTTP 요청 객체
     * @return SseEmitter SSE 연결 객체
     */
    @GetMapping("/subscribe")
    public SseEmitter subscribe(
            HttpServletRequest request) {

        Long userId = oAuthService.findIdByNickName(request);

        return notificationService.subscribe(userId);
    }
}

