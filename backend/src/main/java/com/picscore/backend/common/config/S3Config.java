package com.picscore.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3와의 연동을 위한 설정을 정의하는 설정 클래스
 */
@Configuration
public class S3Config {

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;


    /**
     * S3Client 빈을 생성하여 스프링 컨테이너에 등록
     * AWS S3와의 통신을 위한 클라이언트 객체
     *
     * @return S3Client 객체
     */
    @Bean
    public S3Client s3Client() {
        // AWS 자격 증명 객체 생성
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        // 자격 증명과 리전을 설정하여 S3 클라이언트 생성 및 반환
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}
