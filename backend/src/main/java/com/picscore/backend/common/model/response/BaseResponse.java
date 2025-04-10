package com.picscore.backend.common.model.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 기본적인 json 전송 방식 정의
 */
@Getter
@Setter
public class BaseResponse<T> {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSS")
    private LocalDateTime timeStamp;
    private String message;
    private T data;

    public BaseResponse(String message, T data) {
        this.timeStamp = LocalDateTime.now();
        this.message = message;
        this.data = data;
    }

    public BaseResponse(String message) {
        this.timeStamp = LocalDateTime.now();
        this.message = message;
        this.data = null;
    }

    public static <T> BaseResponse<T> withMessage(String message) {
        return new BaseResponse<>(message);
    }

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>("Success", data);
    }

    public static <T> BaseResponse<T> success(String message, T data) {
        return new BaseResponse<>(message, data);
    }

    public static <T> BaseResponse<T> error(String message) {
        return new BaseResponse<>(message, null);
    }
}

