package com.picscore.backend.timeattack.controller;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.timeattack.model.request.AnalysisPhotoRequest;
import com.picscore.backend.timeattack.model.request.SaveTimeAttackRequest;
import com.picscore.backend.timeattack.model.response.AnalysisPhotoResponse;
import com.picscore.backend.timeattack.service.TimeAttackService;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * TimeAttack 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/time-attack")
@RequiredArgsConstructor
public class TimeAttackController {

    private final TimeAttackService timeAttackService;
    private final OAuthService oAuthService;


    /**
     * TimeAttack 랭킹을 조회하는 API 엔드포인트
     *
     * @param pageNum 조회할 페이지 번호 (1부터 시작)
     * @return ResponseEntity<BaseResponse<Map<String, Object>>> 랭킹 정보를 포함한 응답
     */
    @GetMapping("/{pageNum}")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getRanking(
            @PathVariable int pageNum) {

        Map<String, Object> reponse = timeAttackService.getRanking(pageNum);

        return ResponseEntity.ok(BaseResponse.success("랭킹 전체 목록 조회 성공", reponse));
    }


    /**
     * 사진 분석 요청을 처리하는 API 엔드포인트
     *
     * @param request AnalysisPhotoRequest 객체 (사진 분석 요청 데이터)
     * @return ResponseEntity<BaseResponse<AnalysisPhotoResponse>> 분석 결과 응답
     * @throws IOException 파일 처리 중 발생할 수 있는 입출력 예외
     */
    @PostMapping(value = "/analysis", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<AnalysisPhotoResponse>> analysisPhoto(
            @ModelAttribute AnalysisPhotoRequest request) throws IOException {

        AnalysisPhotoResponse analysisPhotoResponse = timeAttackService.analysisPhoto(request);

        return ResponseEntity.ok(BaseResponse.success("이미지 분석 성공", analysisPhotoResponse));
    }


    /**
     * timeAttack 데이터를 저장하는 API 엔드포인트
     *
     * @param request HttpServletRequest 객체 (사용자 인증 정보를 포함)
     * @param saveTimeAttackRequest SaveTimeAttackRequest 객체 (저장할 timeAttack 데이터)
     * @return ResponseEntity<BaseResponse<HttpStatus>> 저장 결과 응답
     */
    @PostMapping("/save")
    public ResponseEntity<BaseResponse<HttpStatus>> saveTimeAttack(
            HttpServletRequest request,
            @RequestBody SaveTimeAttackRequest saveTimeAttackRequest) {

        Long userId = oAuthService.findIdByNickName(request);
        timeAttackService.saveTimeAttack(userId, saveTimeAttackRequest);

        return ResponseEntity.ok(BaseResponse.success("타임어택 저장 완료", HttpStatus.CREATED));
    }
}

