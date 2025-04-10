package com.picscore.backend.common.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.*;

/**
 * HttpServletRequest를 확장하여 동적으로 헤더와 쿠키를 조작할 수 있도록 지원하는 커스텀 래퍼 클래스
 */
public class CustomHttpServletRequestWrapper extends HttpServletRequestWrapper {

    // 커스텀 헤더 저장용 맵
    private final Map<String, String> customHeaders = new HashMap<>();

    // 수정된 쿠키 배열 (기존 요청에서 복사 후 수정 가능)
    private Cookie[] customCookies;


    /**
     * 생성자 - 기존 HttpServletRequest를 래핑하고 쿠키 배열을 복사함
     */
    public CustomHttpServletRequestWrapper(
            HttpServletRequest request) {

        super(request);
        this.customCookies = request.getCookies(); // 기존 쿠키 복사
    }


    /**
     * 커스텀 헤더 추가 메서드
     * @param name  헤더 이름
     * @param value 헤더 값
     */
    public void addHeader(
            String name, String value) {

        customHeaders.put(name, value);
    }


    /**
     * 쿠키 값 업데이트 메서드
     * - 동일한 이름의 쿠키가 있으면 값을 변경
     * - 없으면 새로 추가
     *
     * @param name  쿠키 이름
     * @param value 새로운 값
     */
    public void updateCookie(
            String name, String value) {

        List<Cookie> updatedCookies = new ArrayList<>();

        boolean found = false;
        if (customCookies != null) {
            for (Cookie cookie : customCookies) {
                if (cookie.getName().equals(name)) {
                    cookie.setValue(value); // 값 변경
                    found = true;
                }
                updatedCookies.add(cookie);
            }
        }

        if (!found) {
            // 새로운 쿠키 추가
            updatedCookies.add(new Cookie(name, value));
        }

        // 최종 쿠키 배열 갱신
        customCookies = updatedCookies.toArray(new Cookie[0]);
    }


    /**
     * 커스텀 헤더가 존재하면 해당 값 반환, 없으면 원래의 요청에서 가져옴
     */
    @Override
    public String getHeader(
            String name) {

        return customHeaders.getOrDefault(name, super.getHeader(name));
    }


    /**
     * 기존 헤더 이름 목록 + 커스텀 헤더 이름 목록 반환
     */
    @Override
    public Enumeration<String> getHeaderNames(
    ) {

        List<String> headerNames = new ArrayList<>(customHeaders.keySet());
        Enumeration<String> originalHeaderNames = super.getHeaderNames();

        while (originalHeaderNames.hasMoreElements()) {
            headerNames.add(originalHeaderNames.nextElement());
        }

        return Collections.enumeration(headerNames);
    }


    /**
     * 현재 설정된 쿠키 배열 반환
     */
    @Override
    public Cookie[] getCookies() {
        return customCookies;
    }
}

