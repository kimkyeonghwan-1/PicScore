package com.picscore.backend.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 관련 설정을 정의하는 설정 클래스
 */
@Configuration
public class RestConfig {


    /**
     * RestTemplate 빈을 생성하여 스프링 컨테이너에 등록
     * 외부 API 호출 시 사용되는 HTTP 통신 도구
     *
     * @return RestTemplate 객체
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

