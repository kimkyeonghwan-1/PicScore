package com.picscore.backend.GPT;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.picscore.backend.common.model.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OpenAiImageService {

    private final RestTemplate restTemplate;
    private final S3Client s3Client;
    @Value("${api.openai.api-key}")
    private String apiKey;
    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    public ResponseEntity<BaseResponse<Map<String,Object>>> analyzeImage(String originalImageUrl, int retryCount) throws IOException {
        final int maxRetry = 2; // 최대 2번 재시도

        // ✅ 1. 원본 이미지 다운로드 후 리사이징
        byte[] resizedImage = resizeImage(originalImageUrl, 500, 500);

        // ✅ 2. 리사이징된 이미지를 S3에 업로드하고 새 URL 반환
        String resizedImageUrl = uploadToS3(resizedImage);

        // ✅ 3. OpenAI API 요청 JSON Body (리사이징된 이미지 URL 전송)
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", "당신은 30년 경력의 사진작가이며 NIMA(Neural Image Assessment)모델을 학습하여 이미지를 분석하고 수치화 할 수 있습니다."),
                        Map.of("role", "user", "content", List.of(
                                Map.of("type", "image_url", "image_url", Map.of("url", resizedImageUrl)),
                                Map.of("type", "text", "text", "출력을 반드시 한국어로 하세요. " +
                                        "1. 다음 여섯 가지 기준에 따라 이미지를 각각 100점 만점으로 평가하세요: " +
                                        "구도, 선명도, 노이즈, 노출, 화이트밸런스, 다이나믹 레인지. 각 기준의 점수를 '기준: 점수: 한 줄 피드백' 형식으로 표현하세요. " +
                                        "2. 이미지와 관련된 주제를 '주제: 주제1, 주제2' 형식으로 출력하세요.")
                        ))
                ),
                "max_tokens", 500
        );

        // ✅ 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // ✅ 요청 엔티티 생성
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // ✅ OpenAI API에 요청 보내기 (예외 처리 강화)
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                // ✅ 응답 파싱
                ResponseEntity<BaseResponse<Map<String, Object>>> result = parseGPTResponse(response.getBody(), originalImageUrl, retryCount);
                return result;
            } else {
                throw new RuntimeException("OpenAI API 요청 실패: HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ OpenAI API 요청 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(BaseResponse.error(e.getMessage()));
        }
    }


    public byte[] resizeImage(String imageUrl, int width, int height) throws IOException {
        // ✅ 안전한 이미지 다운로드
        BufferedImage originalImage = downloadImage(imageUrl);

        // 1️⃣ Thumbnails로 해상도 리사이징
        BufferedImage resizedImage = Thumbnails.of(originalImage)
                .size(width, height)
                .outputQuality(0.8) // 품질 설정 (0.0 ~ 1.0)
                .asBufferedImage();

        // 2️⃣ PNG의 알파 채널을 제거하고 RGB로 변환 (JPG 저장 가능하도록)
        BufferedImage convertedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = convertedImage.createGraphics();

        // 3️⃣ 배경을 흰색으로 설정 (투명도 제거)
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, width, height);

        // 4️⃣ 리사이징된 이미지를 복사 (투명 부분은 흰색으로 채워짐)
        g2d.drawImage(resizedImage, 0, 0, width, height, null);
        g2d.dispose();

        // ✅ 압축된 이미지 변환 (Byte 배열로 변환하여 API로 전달 가능)
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(convertedImage, "jpg", baos);
        return baos.toByteArray();
    }

    // ✅ 리사이징된 이미지를 S3에 업로드하고 URL 반환
    public String uploadToS3(byte[] imageBytes) {
        try {
            String fileName = "resized/" + UUID.randomUUID() + ".jpg";
            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);

            Map<String, String> metadata = new HashMap<>();
            metadata.put("Content-Type", "image/jpeg");

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .metadata(metadata)
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, imageBytes.length));

            return getFileUrl(fileName);
        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패: " + e.getMessage());
        }
    }

    // ✅ 이미지 다운로드
    public static BufferedImage downloadImage(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        // ✅ User-Agent 추가 (403 방지)
        connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");
        connection.setRequestProperty("Accept", "image/*");
        connection.setRequestProperty("Accept-Encoding", "gzip, deflate, br");
        connection.setInstanceFollowRedirects(true);
        connection.connect();

        int responseCode = connection.getResponseCode();
        if (responseCode != 200) {
            throw new IOException("Failed to download image: HTTP " + responseCode);
        }

        try (InputStream inputStream = connection.getInputStream()) {
            return ImageIO.read(inputStream);
        }
    }

    // ✅ 파일 URL 생성
    private String getFileUrl(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                s3Client.serviceClientConfiguration().region(),
                fileName);
    }

    public ResponseEntity<BaseResponse<Map<String, Object>>> parseGPTResponse(String gptApiResponse, String originalImageUrl, int retryCount) throws IOException {
        try {
            // JSON 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(gptApiResponse);

            // GPT 응답에서 "choices.message.content" 부분 추출
            String content = root.path("choices").get(0).path("message").path("content").asText();
//            System.out.println("분석 결과!!! " + content);

            // 점수를 저장할 Map
            Map<String, Integer> scores = new HashMap<>();
            Map<String, Object> response = new HashMap<>();
            Map<String, String> analysisText = new HashMap<>();

            // 1️⃣ 정규식을 사용해 점수 및 피드백 추출
            Pattern scorePattern = Pattern.compile("(구도|선명도|노이즈|노출|화이트밸런스|다이나믹 레인지):\\s*(\\d+)점:\\s*(.+)");
            Matcher scoreMatcher = scorePattern.matcher(content);
            int totalScore = 0;
            int avgScore = 0;
            int count = 0;

            while (scoreMatcher.find()) {
                String category = scoreMatcher.group(1);
                int score = Integer.parseInt(scoreMatcher.group(2));
                String feedback = scoreMatcher.group(3);

                scores.put(category, score);
                analysisText.put(category, feedback);
                totalScore += score;
                count++;
            }

            // 총합 점수 계산 후 추가 (반올림하여 정수로 저장)
            if (count > 0) {
                avgScore = Math.round((float) totalScore / count);
            }

            // ✅ "score"가 0점이면 재요청 실행
            final int maxRetry = 2; // 최대 2번 재시도
            if (avgScore == 0 && retryCount < maxRetry) {
                System.out.println("⚠️ 점수가 0점으로 나왔습니다. API 재요청을 수행합니다. (재시도 횟수: " + (retryCount + 1) + ")");
                return analyzeImage(originalImageUrl, retryCount + 1); // 재요청
            }

            // 2️⃣ 정규식을 사용해 theme(주제) 추출 -> 리스트로 변환
            Pattern themePattern = Pattern.compile("주제:\\s*(.+)");
            Matcher themeMatcher = themePattern.matcher(content);
            if (themeMatcher.find()) {
                response.put("hashTag", splitToList(themeMatcher.group(1)));
            }

            // 최종 응답 데이터 구성
            response.put("analysisChart", scores);
            response.put("analysisText", analysisText);
            response.put("score", avgScore);

            return ResponseEntity.ok(BaseResponse.success("분석 완료", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }



    /**
     * 쉼표(,) 또는 공백( )을 기준으로 문자열을 리스트로 변환하는 유틸 메서드
     */
    private List<String> splitToList(String text) {
        return Arrays.stream(text.split("\\s*,\\s*|\\s+")) // 쉼표 또는 공백 기준 분리
                .filter(word -> !word.isEmpty()) // 빈 문자열 제거
                .toList(); // 리스트로 변환
    }
}
