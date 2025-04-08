package com.picscore.backend.common.exception;

import com.picscore.backend.common.model.response.BaseResponse;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import org.springframework.http.ResponseEntity;
import io.sentry.Sentry;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseResponse<Void>> handleCustomException(CustomException ex) {

        // Sentry에 예외 전송 추가
        SentryEvent event = new SentryEvent(ex);
        event.setLevel(SentryLevel.ERROR); // 명확하게 Handled로 설정
        Sentry.captureEvent(event);

        return ResponseEntity.status(ex.getStatus())
                .body(BaseResponse.error(ex.getMessage()));
    }
}
