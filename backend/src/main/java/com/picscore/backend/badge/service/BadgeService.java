package com.picscore.backend.badge.service;

import com.picscore.backend.badge.model.entity.Badge;
import com.picscore.backend.badge.model.entity.UserBadge;
import com.picscore.backend.badge.model.request.TimeAttackScoreRequest;
import com.picscore.backend.badge.model.response.GetBadgeResponse;
import com.picscore.backend.badge.repository.BadgeRepository;
import com.picscore.backend.badge.repository.UserBadgeRepository;
import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 배지 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;


    /**
     * 사용자의 배지 정보를 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<List<GetBadgeResponse>>> 사용자의 배지 목록을 포함한 응답
     */
    public List<GetBadgeResponse> getBadge(
            Long userId) {

        // 모든 배지 정보를 조회
        List<Badge> badgeList = badgeRepository.findAll();

        // 각 배지에 대해 사용자의 획득 여부를 확인하고 응답 객체로 변환
        List<GetBadgeResponse> response =
                badgeList.stream()
                        .map(badge -> {
                            // 사용자가 해당 배지를 획득했는지 확인
                            Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(
                                    userId, badge.getId()
                            );
                            // 배지 정보와 획득 여부를 포함한 응답 객체 생성
                            return new GetBadgeResponse(
                                    badge.getId(),
                                    badge.getName(),
                                    badge.getImage(),
                                    badge.getObtainCondition(),
                                    isObtain
                            );
                        })
                        .collect(Collectors.toList());

        return response;
    }


    /**
     * 타임 어택 점수를 기반으로 사용자에게 뱃지 부여를 처리하는 메서드
     *
     * @param userId     현재 사용자 ID
     * @param request    타임 어택 점수 요청 정보 (score 포함)
     * @return           뱃지 획득 상태 메시지
     */
    @Transactional
    public String getTimeAttackScore(
            Long userId, TimeAttackScoreRequest request) {

        if (request == null || request.getScore() == 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "점수(score)는 필수 입력값입니다.");
        }

        // 뱃지 조회
        Badge badge = badgeRepository.findByName("badge7")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge7"));

        // 이미 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "타임 어택 점수 뱃지 이미 달성";
        }

        // 점수가 90 이상일 경우 뱃지 획득 처리
        if (request.getScore() >= 90) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge);

            return "타임 어택 점수 뱃지 달성";
        } else {
            return "타임 어택 점수 뱃지 미달성";
        }
    }
}

