package com.picscore.backend.AI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.picscore.backend.common.exception.CustomException;
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
        final String role = "당신은 30년 경력의 사진작가이며 NIMA(Neural Image Assessment)모델을 학습하여 이미지를 분석하고 수치화 할 수 있습니다.";
//        final String task = "출력을 반드시 한국어로 하세요. " +
//                "1. 다음 여섯 가지 기준에 따라 이미지를 각각 100점 만점으로 평가하세요: " +
//                "구도, 선명도, 노이즈, 노출, 화이트밸런스, 다이나믹 레인지. 각 기준의 점수를 '기준: 점수: 한 줄 피드백' 형식으로 표현하세요. " +
//                "2. 이미지와 관련된 주제를 '주제: 주제1, 주제2' 형식으로 출력하세요.";
        final String task = "출력을 반드시 한국어로 하세요.\n" +
                "\n" +
                "1. 다음 여섯 가지 기준에 따라 이미지를 각각 100점 만점으로 평가하세요.\n" +
                "각 항목의 점수는 아래 세부 항목별로 나눠 1점 단위로 정교하게 산정하세요.  \n" +
                "모든 기준은 **총합 100점 만점**이며, 세부 항목에 따라 각각 다음처럼 나눠 평가합니다:" +
                "각 항목마다 '기준명: 점수점: 한 줄 개선 조언' 형식으로 반드시 작성하세요. \n" +
                "예: 구도: 85점: 리딩 라인을 활용하여 시선을 자연스럽게 유도해 보세요." +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-1.구도 (Composition) - 총 100점\n" +
                "- 삼등분법 또는 중심 구도 중 하나 이상이 명확하게 적용되었는가? (최대 25점)\n" +
                "- 리딩 라인(길, 철로, 줄기 등)을 통해 시선이 자연스럽게 유도되는가? (최대 25점)\n" +
                "- 프레이밍(문, 창, 나뭇가지 등) 요소를 통해 피사체가 강조되는가? (최대 25점)\n" +
                "- 전체적인 시선 흐름이 안정적이고 명확한가? (최대 25점)\n" +
                "\n" +
                "예시 개선 조언: \"구도:77점:피사체 위치를 삼등분 지점에 배치해 시선 흐름을 개선해보세요.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-2.선명도 (Sharpness)\n" +
                "- 피사체 초점이 정확한가? (최대 40점)\n" +
                "- 흐림 효과가 의도된 보케인지 판단되는가? (최대 30점)\n" +
                "- 질감, 디테일이 선명하게 표현되었는가? (최대 30점)\n" +
                "\n" +
                "예시 개선 조언: \"선명도:72점:초점이 흐릿하므로 삼각대 사용이나 초점 재설정이 필요합니다.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-3.주제 (Subject)\n" +
                "- 주제가 명확하게 드러나는가? (최대 50점)\n" +
                "- 사진이 감정을 자극하거나 메시지를 전달하는가? (최대 30점)\n" +
                "- 주변 배경이 주제를 잘 보완하고 있는가? (최대 20점)\n" +
                "\n" +
                "예시 개선 조언: \"주제:28점:주제가 다소 모호하므로, 중심 피사체에 더 집중해보세요.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-4.노출 (Exposure)\n" +
                "- 과노출된 하이라이트가 없는가? (최대 30점)\n" +
                "- 저노출로 인해 디테일 손실이 없는가? (최대 30점)\n" +
                "- 명암 대비가 자연스럽고 균형 잡혔는가? (최대 40점)\n" +
                "\n" +
                "예시 개선 조언: \"노출:62점:어두운 부분의 디테일이 부족하니 노출 보정을 고려해보세요.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-5.색감 (Color Harmony)\n" +
                "- 색 표현이 자연스럽고 왜곡이 없는가? (최대 40점)\n" +
                "- 채도가 적절하며 과하거나 부족하지 않은가? (최대 30점)\n" +
                "- 색 조화가 잘 이루어져 시각적으로 매력적인가? (최대 30점)\n" +
                "\n" +
                "예시 개선 조언: \"색감:49점:채도가 지나치게 높아 자연스러움이 떨어질 수 있습니다.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "## 1-6.미학적평가 (Aesthetic Quality)\n" +
                "- 시각적으로 인상적이고 아름다운가? (최대 40점)\n" +
                "- 스토리, 메시지, 감정이 느껴지는가? (최대 30점)\n" +
                "- 창의적이거나 독창적인 시도나 시각 요소가 있는가? (최대 30점)\n" +
                "\n" +
                "예시 개선 조언: \"미학적평가:74점:독창적인 각도나 감정 표현을 시도해보면 미학적 완성도가 높아집니다.\"\n" +
                "\n" +
                "---\n" +
                "\n" +
                "2. 모든 항목 평가가 끝난 후, '종합평가: 전체 평가 내용' 형식으로 1~2문장 요약을 작성하세요. \n" +
                "예시: 종합평가:전반적으로 안정적인 구도와 색감을 지닌 사진입니다. 주제 전달이 조금 더 명확해지면 완성도가 더욱 올라갈 수 있습니다.\n" +
                "\n" +
                "3. 마지막으로 이미지와 관련된 주제를 '태그: 태그1, 태그2' 형식으로 간단히 출력하세요.\n";
        // ✅ 1. 원본 이미지 다운로드 후 리사이징
        byte[] resizedImage = resizeImage(originalImageUrl, 500, 500);

        // ✅ 2. 리사이징된 이미지를 S3에 업로드하고 새 URL 반환
        String resizedImageUrl = uploadToS3(resizedImage);

        // ✅ 3. OpenAI API 요청 JSON Body (리사이징된 이미지 URL 전송)
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", role),
                        Map.of("role", "user", "content", List.of(
                                Map.of("type", "image_url", "image_url", Map.of("url", resizedImageUrl)),
                                Map.of("type", "text", "text", task)
                        ))
                ),
                "max_tokens", 3000
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
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "OpenAI API 요청 실패: HTTP " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ OpenAI API 요청 중 오류 발생: " + e.getMessage());
            throw new CustomException(HttpStatus.CONFLICT, e.getMessage());
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
            System.out.println("분석 결과!!! " + content);

            // 점수를 저장할 Map
            Map<String, Integer> scores = new HashMap<>();
            Map<String, Object> response = new HashMap<>();
            Map<String, String> analysisText = new HashMap<>();

            // 1️⃣ 정규식을 사용해 점수 및 피드백 추출
            Pattern scorePattern = Pattern.compile("(구도|선명도|주제|노출|색감|미적감각):\\s*(\\d+)점:\\s*(.+)");
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

            // ✅ 종합평가 파싱 추가
            Pattern summaryPattern = Pattern.compile("종합평가:\\s*(.+)");
            Matcher summaryMatcher = summaryPattern.matcher(content);
            if (summaryMatcher.find()) {
                response.put("comment", summaryMatcher.group(1)); // 여기에 종합 코멘트를 저장
            }

            // 2️⃣ 정규식을 사용해 theme(주제) 추출 -> 리스트로 변환
            Pattern themePattern = Pattern.compile("태그:\\s*(.+)");
            Matcher themeMatcher = themePattern.matcher(content);
            if (themeMatcher.find()) {
                response.put("hashTag", splitToList(themeMatcher.group(1)));
            }

            // 최종 응답 데이터 구성
            response.put("analysisChart", scores);
            response.put("analysisText", analysisText);
            response.put("score", avgScore);
            response.put("version", 2);

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
