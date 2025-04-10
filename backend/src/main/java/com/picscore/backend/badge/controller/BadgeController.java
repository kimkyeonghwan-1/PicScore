package com.picscore.backend.badge.controller;

import com.picscore.backend.badge.model.request.TimeAttackScoreRequest;
import com.picscore.backend.badge.model.response.CompleteCheckResponse;
import com.picscore.backend.badge.model.response.GetBadgeResponse;
import com.picscore.backend.badge.service.BadgeService;
import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.user.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 배지 관련 API를 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final OAuthService oAuthService;
    private final BadgeService badgeService;


    /**
     * 사용자의 배지 정보를 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체
     * @return ResponseEntity<BaseResponse < List < GetBadgeResponse>>> 사용자의 배지 목록을 포함한 응답
     */
    @GetMapping("")
    public ResponseEntity<BaseResponse<List<GetBadgeResponse>>> getBadge(
            HttpServletRequest request) {

        Long userId = oAuthService.findIdByNickName(request);
        List<GetBadgeResponse> getBadgeResponseList = badgeService.getBadge(userId);

        return ResponseEntity.ok(BaseResponse.success("전체 뱃지 목록 조회", getBadgeResponseList));
    }


    /**
     * 사용자의 업적(뱃지) 달성 여부를 확인하는 API
     *
     * @param request 클라이언트 요청 객체 (사용자 인증 정보를 포함)
     * @return ResponseEntity<BaseResponse<CompleteCheckResponse>> 업적 달성 상태를 포함한 응답 객체
     */
    @PostMapping("/complete")
    public ResponseEntity<BaseResponse<CompleteCheckResponse>> completeCheck(
            HttpServletRequest request) {

        // 사용자 ID 조회 (OAuth 인증 정보를 기반으로)
        Long userId = oAuthService.findIdByNickName(request);

        // 각 업적(뱃지) 달성 여부 확인
        String badge1 = badgeService.followOne(userId);       // 첫 팔로워 얻기
        String badge2 = badgeService.followTwo(userId);       // 팔로워 30명 이상 달성
        String badge5 = badgeService.postOne(userId);         // 첫 게시글 작성
        String badge6 = badgeService.postTwo(userId);         // 게시글 10개 작성
        String badge8 = badgeService.timeAttackOne(userId);   // 타임어택 20회 참여
        String badge10 = badgeService.timeAttackRank(userId); // 타임어택 랭킹 1위 달성
        String badge7 = badgeService.timeAttackScore(userId); // 타임어택 90점 이상 달성
        String badge9 = badgeService.photoScore(userId);      // 사진 평가 90점 달성
        String badge11 = badgeService.photoLike(userId);      // 게시글 좋아요 10개 달성
        String badge12 = badgeService.obtainAll(userId);      // 모든 업적 달성

        // 업적 정보 응답 객체 생성
        CompleteCheckResponse response = new CompleteCheckResponse(
                badge1, badge2, "미달성", "미달성", badge5, badge6,
                badge7, badge8, badge9, badge10, badge11, badge12
        );

        // 업적 달성 상태를 포함한 응답 반환
        return ResponseEntity.ok(BaseResponse.success("업적 완료 확인", response));
    }


    /**
     * 타임 어택 점수에 따라 뱃지를 획득하거나 상태를 반환하는 API
     *
     * @param request 클라이언트 요청 객체 (사용자 인증 정보를 포함)
     * @param timeAttackScoreRequest 타임 어택 점수 요청 객체 (점수 정보를 포함)
     * @return ResponseEntity<BaseResponse<Void>> 결과 메시지를 포함한 응답 객체
     */
    @PostMapping("/time-attack/score")
    public ResponseEntity<BaseResponse<Void>> getTimeAttackScore(
            HttpServletRequest request,
            @RequestBody TimeAttackScoreRequest timeAttackScoreRequest) {

        Long userId = oAuthService.findIdByNickName(request);
        String resultMessage = badgeService.getTimeAttackScore(userId, timeAttackScoreRequest);

        return ResponseEntity.ok(BaseResponse.withMessage(resultMessage));
    }
}

