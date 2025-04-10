package com.picscore.backend.common.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();


    /**
     * 사용자를 SSE 구독 상태로 등록
     *
     * @param userId 사용자 ID
     * @return SseEmitter 객체
     */
    public SseEmitter subscribe(
            Long userId) {

        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L);
        emitters.put(userId, emitter);

        // 연결 종료 시 Emitter 제거
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        return emitter;
    }


    /**
     * 특정 사용자에게 알림 전송
     *
     * @param userId  사용자 ID
     * @param message 알림 메시지
     */
    public void sendNotification(
            Long userId, String message) {

        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(message));
            } catch (IOException e) {
                emitters.remove(userId); // 전송 실패 시 제거
            }
        }
    }
}

