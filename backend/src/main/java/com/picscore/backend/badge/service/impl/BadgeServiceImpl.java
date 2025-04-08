package com.picscore.backend.badge.service.impl;

import com.picscore.backend.badge.model.entity.Badge;
import com.picscore.backend.badge.model.entity.UserBadge;
import com.picscore.backend.badge.model.request.TimeAttackScoreRequest;
import com.picscore.backend.badge.model.response.GetBadgeResponse;
import com.picscore.backend.badge.repository.BadgeRepository;
import com.picscore.backend.badge.repository.UserBadgeRepository;
import com.picscore.backend.badge.service.BadgeService;
import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.photo.repository.PhotoLikeRepository;
import com.picscore.backend.photo.repository.PhotoRepository;
import com.picscore.backend.timeattack.repository.TimeAttackRepository;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.repository.FollowRepository;
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
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PhotoRepository photoRepository;
    private final TimeAttackRepository timeAttackRepository;
    private final PhotoLikeRepository photoLikeRepository;


    /**
     * 사용자의 배지 정보를 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<List<GetBadgeResponse>>> 사용자의 배지 목록을 포함한 응답
     */
    @Override
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
     * 특정 사용자가 한 명 이상의 팔로워를 가지면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String followOne(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge1" 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge1")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge1"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자의 팔로워 수 조회
        int followerCnt = followRepository.countByFollowingId(userId);

        // 5. 팔로워가 한 명 이상이면 뱃지를 부여
        if (followerCnt >= 1) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 팔로워가 부족하여 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 30명 이상의 팔로워를 달성하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String followTwo(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge2" (팔로워 30명 이상) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge2")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge2"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자의 팔로워 수 조회
        int followerCnt = followRepository.countByFollowingId(userId);

        // 5. 팔로워가 30명 이상이면 뱃지를 부여
        if (followerCnt >= 30) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 팔로워 수 부족으로 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 첫 번째 게시글을 작성하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String postOne(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge5" (첫 게시글 작성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge5")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge5"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자의 게시글 수 조회
        int postCnt = photoRepository.countByUserId(userId);

        // 5. 게시글이 1개 이상이면 뱃지를 부여
        if (postCnt >= 1) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 게시글 개수 부족으로 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 게시글을 10개 이상 작성하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String postTwo(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge6" (게시글 10개 작성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge6")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge6"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자의 게시글 수 조회
        int postCnt = photoRepository.countByUserId(userId);

        // 5. 게시글이 10개 이상이면 뱃지를 부여
        if (postCnt >= 10) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 게시글 개수 부족으로 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 타임어택을 20회 이상 참여하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String timeAttackOne(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge8" (타임어택 20회 참여) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge8")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge8"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자의 타임어택 참여 횟수 조회
        int timeAttackCnt = timeAttackRepository.countByUserId(userId);

        // 5. 타임어택을 20회 이상 참여했다면 뱃지 부여
        if (timeAttackCnt >= 20) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 참여 횟수 부족으로 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 타임어택에서 1위를 달성하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String timeAttackRank(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge10" (타임어택 1위 달성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge10")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge10"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자가 타임어택에서 1위를 한 기록이 있는지 확인
        boolean hasFirstRank = Boolean.TRUE.equals(timeAttackRepository.existsByUserIdAndRanking(userId, 1));

        // 5. 1위 기록이 있다면 뱃지 부여
        if (hasFirstRank) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 1위 기록이 없어 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 타임어택에서 90점 이상을 기록하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String timeAttackScore(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge7" (타임어택 90점 이상 달성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge7")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge7"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자가 타임어택에서 90점 이상을 기록한 적이 있는지 확인
        boolean hasHighScore = Boolean.TRUE.equals(timeAttackRepository.existsByUserIdAndScoreGreaterThanEqual(userId, 90.0f));

        // 5. 90점 이상 기록이 있다면 뱃지 부여
        if (hasHighScore) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 90점 이상 기록이 없어 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 사진 평가에서 90점 이상을 기록하면 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String photoScore(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge9" (사진 평가 90점 이상 달성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge9")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge9"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자가 사진 평가에서 90점 이상을 받은 적이 있는지 확인
        boolean hasHighScore = Boolean.TRUE.equals(photoRepository.existsByUserIdAndScoreGreaterThanEqual(userId, 90.0f));

        // 5. 90점 이상 기록이 있다면 뱃지 부여
        if (hasHighScore) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        } else {
            return "미달성"; // 90점 이상 기록이 없어 뱃지를 얻지 못함
        }
    }


    /**
     * 사용자가 올린 사진 중 좋아요 10개 이상 받은 사진이 있을 경우 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String photoLike(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 뱃지 조회: "badge11" (게시글 좋아요 10개 이상 달성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge11")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge11"));

        // 3. 사용자가 이미 해당 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자가 올린 사진 ID 목록 조회
        List<Long> photoIds = photoRepository.findPhotoIdsByUserId(userId);

        // 5. 좋아요 10개 이상 받은 사진이 있는지 확인
        boolean hasPhotoWith10Likes = Boolean.TRUE.equals(photoLikeRepository.existsByPhotoIdInAndLikeCountGreaterThanEqual(photoIds));

        // 6. 조건 충족 시 뱃지 부여
        if (hasPhotoWith10Likes) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 뱃지 부여 완료
        }
        return "미달성"; // 조건을 충족하지 못하면 미달성 반환
    }


    /**
     * 사용자가 모든 업적(뱃지)을 획득했는지 확인하고, 달성 시 최종 뱃지를 부여하는 메서드
     *
     * @param userId 현재 사용자 ID
     * @return 뱃지 획득 여부 메시지
     */
    @Override
    @Transactional
    public String obtainAll(Long userId) {

        // 1. 유저 조회: 주어진 userId에 해당하는 사용자를 찾음
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        // 2. 최종 업적 뱃지 조회: "badge12" (모든 업적 달성) 뱃지가 존재하는지 확인
        Badge badge = badgeRepository.findByName("badge12")
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "뱃지를 찾을 수 없음: badge12"));

        // 3. 사용자가 이미 최종 업적 뱃지를 획득했는지 확인
        Boolean isObtain = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());

        if (isObtain) {
            return "이미 달성"; // 이미 뱃지를 가지고 있다면 그대로 반환
        }

        // 4. 사용자가 획득한 전체 뱃지 개수 조회
        int completeCnt = userBadgeRepository.countByUserId(userId);

        // 5. 모든 12개의 뱃지를 획득했는지 확인 후 최종 뱃지 부여
        if (completeCnt == 12) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge); // 뱃지 정보 저장
            return "달성"; // 최종 업적 뱃지 부여 완료
        }
        return "미달성"; // 모든 뱃지를 모으지 못했다면 미달성 반환
    }


    /**
     * 타임 어택 점수를 기반으로 사용자에게 뱃지 부여를 처리하는 메서드
     *
     * @param userId     현재 사용자 ID
     * @param request    타임 어택 점수 요청 정보 (score 포함)
     * @return           뱃지 획득 상태 메시지
     */
    @Override
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

