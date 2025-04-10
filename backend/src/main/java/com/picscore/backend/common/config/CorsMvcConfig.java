package com.picscore.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {


    /**
     * CORS 설정을 추가합니다.
     *
     * @param corsRegistry CORS 설정을 등록하는 객체
     */
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {
        corsRegistry.addMapping("/**") // 모든 경로에 대해 CORS 설정 적용
                .exposedHeaders("Set-Cookie", "Authorization") // Authorization 추가
                .allowedOrigins("http://localhost:5173", "https://j12b104.p.ssafy.io",
                        "https://picscore.net"); // 허용할 Origin 설정
    }
}
