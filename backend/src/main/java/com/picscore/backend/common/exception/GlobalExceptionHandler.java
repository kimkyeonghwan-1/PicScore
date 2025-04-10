package com.picscore.backend.common.exception;

import com.picscore.backend.common.model.response.BaseResponse;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import org.springframework.http.ResponseEntity;
import io.sentry.Sentry;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리를 담당하는 핸들러 클래스
 * 모든 컨트롤러에서 발생하는 예외를 한 곳에서 처리
 */
@RestControllerAdvice
public class GlobalExceptionHandler {


    /**
     * CustomException 예외가 발생했을 때 처리하는 메서드
     * 예외 정보를 Sentry에 전송하고, 클라이언트에게 에러 메시지를 포함한 응답 반환
     *
     * @param ex CustomException 발생한 사용자 정의 예외 객체
     * @return ResponseEntity<BaseResponse<Void>> 에러 메시지와 상태 코드를 포함한 응답
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseResponse<Void>> handleCustomException(
            CustomException ex) {

        // 예외 정보를 Sentry로 전송하여 오류 추적 가능하게 함
        SentryEvent event = new SentryEvent(ex);
        event.setLevel(SentryLevel.ERROR); // 오류 레벨을 ERROR로 설정
        Sentry.captureEvent(event);

        // 예외에 지정된 상태 코드와 메시지를 포함한 응답 반환
        return ResponseEntity.status(ex.getStatus())
                .body(BaseResponse.error(ex.getMessage()));
    }
}

