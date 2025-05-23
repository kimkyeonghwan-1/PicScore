package com.picscore.backend.AI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.common.model.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 이미지 분석을 위해 LAVA API와 연동하는 서비스 클래스입니다.
 *
 * 기능:
 *     원본 이미지를 리사이징
 *     리사이징된 이미지를 S3에 업로드
 *     리사이징된 이미지 URL을 LAVA API에 POST 요청
 *     응답을 Map으로 변환하여 반환
 */
@Service
@RequiredArgsConstructor
public class LavaImageService {

    private final RestTemplate restTemplate;
    private final S3Client s3Client;
    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;
    private final OpenAiImageService openAiImageService;


    /**
     * 원본 이미지 URL을 기반으로 이미지를 리사이징하고, LAVA API에 분석 요청을 보냅니다.
     *
     * @param originalImageUrl S3 또는 외부 URL의 이미지 경로
     * @return 분석 결과가 포함된 {@link BaseResponse}
     * @throws IOException 이미지 리사이징 또는 변환 중 발생하는 예외
     */
    public ResponseEntity<BaseResponse<Map<String, Object>>> analyzeImage(
            String originalImageUrl) throws IOException {

        // ✅ 1. 원본 이미지 다운로드 후 리사이징
        byte[] resizedImage = openAiImageService.resizeImage(originalImageUrl, 500, 500);

        // ✅ 2. 리사이징된 이미지를 S3에 업로드하고 새 URL 반환
        String resizedImageUrl = openAiImageService.uploadToS3(resizedImage);

        // ✅ 3. OpenAI API 요청 JSON Body (리사이징된 이미지 URL 전송)
        Map<String, Object> requestBody = Map.of("image_url",resizedImageUrl);

        // ✅ 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // ✅ 요청 엔티티 생성
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // ✅ OpenAI API에 요청 보내기 (예외 처리 강화)
        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    "http://15.164.216.52:8000/api/v1/image/analyze",
                    HttpMethod.POST,
                    requestEntity,
                    JsonNode.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = response.getBody();

                // 필요하면 JsonNode → Map으로 변환
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> responseMap = mapper.convertValue(jsonResponse, Map.class);

                return ResponseEntity.ok(BaseResponse.success("분석 완료", responseMap));
            } else {
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "LAVA API 요청 실패: HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ LAVA API 요청 중 오류 발생: " + e.getMessage());
            throw new CustomException(HttpStatus.CONFLICT, e.getMessage());
        }
    }
}
