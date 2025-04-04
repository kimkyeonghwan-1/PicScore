package com.picscore.backend.timeattack.service;

import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.photo.service.PhotoService;
import com.picscore.backend.timeattack.model.entity.TimeAttack;
import com.picscore.backend.timeattack.model.request.AnalysisPhotoRequest;
import com.picscore.backend.timeattack.model.request.SaveTimeAttackRequest;
import com.picscore.backend.timeattack.model.response.AnalysisPhotoResponse;
import com.picscore.backend.timeattack.model.response.AzureVisionResponse;
import com.picscore.backend.timeattack.model.response.GetRankingResponse;
import com.picscore.backend.timeattack.repository.TimeAttackRepository;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TimeAttack 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class TimeAttackService {

    private final TimeAttackRepository timeAttackRepository;
    private final UserRepository userRepository;

    private final PhotoService photoService;

    private final RestTemplate restTemplate;
    private final S3Client s3Client;

    private final SecureRandom secureRandom = new SecureRandom();



    @Value("${AZURE_ENDPOINT}")  // 환경 변수에서 API URL 가져오기
    private String visionApiUrl;

    @Value("${AZURE_COMPUTER_VISION_KEY}")  // 환경 변수에서 API Key 가져오기
    private String visionApiKey;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;


    /**
     * 페이지별 TimeAttack 랭킹을 조회하는 메소드
     *
     * @param pageNum 조회할 페이지 번호 (1부터 시작)
     * @return ResponseEntity<BaseResponse<Map<String, Object>>> 랭킹 정보를 포함한 응답
     */
    @Transactional
    public Map<String, Object> getRanking(
            int pageNum) {

        // pageNum이 1보다 작은 경우 예외 처리
        if (pageNum < 1) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상의 값이어야 합니다.");
        }

        // 페이지 요청 객체 생성 (페이지당 5개 항목)
        PageRequest pageRequest = PageRequest.of(pageNum-1, 5);

        // 레포지토리에서 사용자별 최고 점수 조회
        Page<TimeAttack> timeAttackPage = timeAttackRepository.findHighestScoresPerUser(pageRequest);

        // 페이지 데이터 존재 여부 확인
        if (timeAttackPage == null || pageNum > timeAttackPage.getTotalPages() || timeAttackPage.getContent().isEmpty()) {
            throw new CustomException(HttpStatus.NOT_FOUND, "해당 페이지에 랭킹 정보가 없습니다");
        }

        List<GetRankingResponse> rankingResponses = new ArrayList<>();
        int baseRank = (pageNum - 1) * 5; // 현재 페이지의 기본 순위 계산

        // 조회된 TimeAttack 데이터를 GetRankingResponse 객체로 변환
        for (int i = 0; i < timeAttackPage.getContent().size(); i++) {
            TimeAttack timeAttack = timeAttackPage.getContent().get(i);

            int newRank = baseRank + i + 1;
            // 랭킹 업데이트
            timeAttack.updateRanking(newRank);
            // 변경 사항 저장
            timeAttackRepository.save(timeAttack);

            rankingResponses.add(new GetRankingResponse(
                    timeAttack.getUser().getId(),
                    timeAttack.getUser().getNickName(),
                    timeAttack.getUser().getProfileImage(),
                    timeAttack.getPhotoImage(),
                    timeAttack.getTopic(),
                    timeAttack.getScore(),
                    newRank
            ));
        }

        // 응답 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("totalPage", timeAttackPage.getTotalPages());
        responseData.put("ranking", rankingResponses);

        // 성공 응답 반환
        return responseData;
    }


    /**
     * 사진을 분석하고 결과를 반환하는 메서드
     *
     * @param request AnalysisPhotoRequest 객체 (분석할 이미지와 주제 정보 포함)
     * @return ResponseEntity<BaseResponse<AnalysisPhotoResponse>> 분석 결과 응답
     * @throws IOException 파일 처리 중 발생할 수 있는 입출력 예외
     */
    public AnalysisPhotoResponse analysisPhoto(
            AnalysisPhotoRequest request) throws IOException {

        if (request == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "요청 객체가 비어 있습니다.");
        }

        if (request.getImageFile() == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "이미지 파일은 필수 입력값입니다.");
        }

        if (request.getTopic() == null || request.getTopic().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "주제(topic)는 필수 입력값입니다.");
        }

        if (request.getTime() == null || request.getTime().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "시간(time)은 필수 입력값입니다.");
        }

        String url = visionApiUrl + "vision/v3.2/analyze?visualFeatures=Tags";

        // HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set("Ocp-Apim-Subscription-Key", visionApiKey);

        // 이미지 파일을 바이트 배열로 변환
        byte[] imageFileBytes = request.getImageFile().getBytes();
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageFileBytes, headers);

        try {
            // Azure Vision API 호출
            ResponseEntity<AzureVisionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    AzureVisionResponse.class
            );

            float time = 20f;
            time = Float.parseFloat(request.getTime());
            final float adjustedTime = time / 20f;

            // 응답 자체가 유효하지 않은 경우 예외 처리
            if (response == null || response.getBody() == null) {
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 분석 결과가 유효하지 않습니다");
            }

            // API 응답에서 태그 정보 추출 및 변환
            List<AnalysisPhotoResponse> analysisResults = response.getBody().getTags().stream()
                    .map(tag -> new AnalysisPhotoResponse(
                            tag.getName(), tag.getConfidence(), tag.getConfidence() * 0.7f + adjustedTime * 0.3f))
                    .collect(Collectors.toList());

            // 요청된 주제와 일치하는 태그 중 가장 높은 신뢰도를 가진 태그 선택
            AnalysisPhotoResponse result = analysisResults.stream()
                    .filter(tag -> tag.getName().toLowerCase().contains(request.getTopic().toLowerCase()))
                    .max(Comparator.comparing(AnalysisPhotoResponse::getConfidence))
                    .orElseGet(() -> {
                        // 랜덤한 값(0.00 ~ 0.20) 생성
                        float randomConfidence = secureRandom.nextFloat() * 0.20f;
                        return new AnalysisPhotoResponse("일치 항목 없음", randomConfidence, randomConfidence * 0.7f + adjustedTime * 0.3f);
                    });

            return result;
        } catch (RestClientException e) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 분석 실패: " + e.getMessage());
        }
    }


    /**
     * 타임어택 결과를 저장하는 메서드
     *
     * @param userId 사용자 ID
     * @param request SaveTimeAttackRequest 객체 (저장할 타임어택 정보)
     * @return ResponseEntity<BaseResponse<HttpStatus>> 저장 결과 응답
     */
    @Transactional
    public void saveTimeAttack(
            Long userId, SaveTimeAttackRequest request) {

        if (request == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "요청 값이 잘못되었습니다. 요청 객체가 비어 있습니다.");
        }

        if (request.getImageName() == null || request.getImageName().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "이미지 이름은 필수 입력값입니다.");
        }

        if (request.getTopic() == null || request.getTopic().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "주제는 필수 입력값입니다.");
        }

        if (request.getScore() == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "점수(score)는 필수 입력값입니다.");
        }

        if (request.getScore() < 0 || request.getScore() > 100) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "점수는 0에서 100 사이의 값이어야 합니다.");
        }

        // 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        String tempFolder = "temp/";
        String activityFolder = "activity/";

        try {
            // S3에서 임시 폴더의 이미지를 activity 폴더로 이동
            CopyObjectRequest copyObjectRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(tempFolder + request.getImageName())
                    .destinationBucket(bucketName)
                    .destinationKey(activityFolder + request.getImageName())
                    .build();
            s3Client.copyObject(copyObjectRequest);
        } catch (S3Exception e) {
            if (e.statusCode() == 404) { // HTTP 404 상태 코드 확인
                throw new CustomException(HttpStatus.NOT_FOUND, "S3에 해당 이미지 파일이 존재하지 않습니다: " + request.getImageName());
            }
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 파일 이동 중 오류 발생: " + e.getMessage());
        }

        // 새로운 이미지 URL 생성
        String activityImageUrl = photoService.getFileUrl(activityFolder, request.getImageName());

        // 타임어택 정보를 DB에 저장
        String activityWeek = getCurrentGameWeek();
        System.out.printf("이번 게임 주차는!!!=="+activityWeek);
        TimeAttack timeAttack = new TimeAttack(
                user, activityImageUrl, request.getTopic(), 1, request.getScore()
        );
        timeAttackRepository.save(timeAttack);

        int experience = userRepository.findExperienceByUserId(userId);
        int plusExperience = experience + (int) (request.getScore() * 10);
        user.updateExperience(plusExperience);
        user.updateLevel(plusExperience);
        userRepository.save(user);
    }
    // ✅ 현재 주차의 게임 ID 가져오기
    public String getCurrentGameWeek() {
        LocalDate now = LocalDate.now(ZoneId.of("UTC"));
        int year = now.getYear();
        int week = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        return String.format("%d%02d", year, week);
    }
}

