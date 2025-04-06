package com.picscore.backend.user.service.impl;

import com.picscore.backend.arena.model.entity.Arena;
import com.picscore.backend.arena.repository.ArenaRepository;
import com.picscore.backend.badge.model.dto.ProfileBadgeDto;
import com.picscore.backend.badge.model.entity.Badge;
import com.picscore.backend.badge.model.entity.UserBadge;
import com.picscore.backend.badge.repository.UserBadgeRepository;
import com.picscore.backend.common.exception.CustomException;
import com.picscore.backend.common.utill.GameWeekUtil;
import com.picscore.backend.common.utill.RedisUtil;
import com.picscore.backend.photo.service.PhotoService;
import com.picscore.backend.timeattack.model.entity.TimeAttack;
import com.picscore.backend.timeattack.model.response.GetMyStaticResponse;
import com.picscore.backend.timeattack.model.response.GetUserStaticResponse;
import com.picscore.backend.timeattack.repository.TimeAttackRepository;
import com.picscore.backend.common.jwt.JWTUtil;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.model.entity.UserFeedback;
import com.picscore.backend.user.model.request.SaveFeedbackRequest;
import com.picscore.backend.user.model.request.UpdateMyProfileRequest;
import com.picscore.backend.user.model.response.GetMyProfileResponse;
import com.picscore.backend.user.model.response.GetUserProfileResponse;
import com.picscore.backend.user.model.response.LoginInfoResponse;
import com.picscore.backend.user.model.response.SearchUsersResponse;
import com.picscore.backend.user.repository.FollowRepository;
import com.picscore.backend.user.repository.UserFeedbackRepository;
import com.picscore.backend.user.repository.UserRepository;
import com.picscore.backend.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 관련 서비스를 제공하는 클래스
 * - 로그인 정보 조회
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final TimeAttackRepository timeAttackRepository;
    private final ArenaRepository arenaRepository;
    private final UserFeedbackRepository userFeedbackRepository;

    private final JWTUtil jwtUtil;
    private final RedisUtil redisUtil;
    private final GameWeekUtil gameWeekUtil;

    private final PhotoService photoService;


    /**
     * 현재 로그인한 사용자의 정보를 가져오는 메서드
     *
     * @param request HTTP 요청 객체 (쿠키에서 AccessToken 추출)
     * @return LoginInfoResponse
     *         - 로그인 정보를 포함하는 응답 객체
     */
    @Override
    public LoginInfoResponse LoginInfo(
            HttpServletRequest request) {

        // 쿠키에서 AccessToken 찾기
        Optional<Cookie> accessTokenCookie = Arrays.stream(request.getCookies())
                .filter(cookie -> "access".equals(cookie.getName()))
                .findFirst();

        // AccessToken 쿠키가 없는 경우
        if (accessTokenCookie.isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "AccessToken 쿠키 없음");
        }

        // JWT에서 닉네임(유저 식별자) 추출
        String accessToken = accessTokenCookie.get().getValue();

        String nickName = jwtUtil.getNickName(accessToken);

        // 유효하지 않은 토큰인 경우
        if (nickName == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰");
        }

        // 닉네임으로 사용자 조회
        User user = userRepository.findByNickName(nickName);
        // 사용자를 찾을 수 없는 경우
        if (user == null) {
            throw new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음");
        }

        // 유저 정보 + 토큰 반환
        return new LoginInfoResponse(
                user.getId(), user.getNickName(), user.getMessage(),
                user.getLevel(), user.getExperience());
    }


    /**
     * 사용자 검색 기능을 제공하는 메서드
     *
     * @param searchText 검색할 닉네임 텍스트
     * @return ResponseEntity<BaseResponse<List<SearchUsersResponse>>> 검색된 사용자 목록을 포함한 응답
     */
    @Override
    public List<SearchUsersResponse> searchUser(
            String searchText) {

        // 1. 주어진 검색어로 시작하는 닉네임을 가진 사용자들을 데이터베이스에서 조회
        List<User> userList = userRepository.findByNickNameContaining(searchText);

        // 2. 조회된 사용자 목록을 SearchUsersResponse DTO로 변환
        List<SearchUsersResponse> response =
                userList.stream() // 스트림 생성
                        .map(user -> { // 각 User 객체를 SearchUsersResponse로 변환
                            return new SearchUsersResponse(
                                    user.getId(), // 사용자 ID
                                    user.getProfileImage(), // 프로필 이미지 URL
                                    user.getNickName(), // 닉네임
                                    user.getMessage() // 상태 메시지
                            );
                        })
                        .collect(Collectors.toList()); // 변환된 객체들을 리스트로 수집

        // 3. 성공 응답 생성 및 반환
        return response;
    }


    /**
     * 현재 사용자의 프로필 정보를 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetMyProfileResponse>> 사용자 프로필 정보 응답
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우 발생
     */
    @Override
    public GetMyProfileResponse getMyProfile(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        int followerCnt = followRepository.countByFollowingId(userId);
        int followingCnt = followRepository.countByFollowerId(userId);

        List<UserBadge> userBadgeList = userBadgeRepository.findByUserId(userId);
        List<ProfileBadgeDto> profileBadgeList =
                userBadgeList.stream()
                        .map(userBadge -> {
                            Badge badge = userBadge.getBadge();
                            return new ProfileBadgeDto(
                                    badge.getId(),
                                    badge.getName(),
                                    badge.getImage()
                            );
                        })
                        .collect(Collectors.toList());

        GetMyProfileResponse response = new GetMyProfileResponse(
                user.getId(), user.getNickName(), user.getProfileImage(),
                user.getMessage(), user.getLevel(), user.getExperience(),
                followerCnt, followingCnt, profileBadgeList
        );

        return response;
    }


    /**
     * 특정 사용자의 프로필 정보를 조회하는 메서드
     *
     * @param myId 현재 로그인한 사용자의 ID
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetUserProfileResponse>> 사용자 프로필 정보 응답
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우 발생
     */
    @Override
    public GetUserProfileResponse getUserProfile(
            Long myId, Long userId
    ) {

        if (userId == null || userId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자 ID입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        int followerCnt = followRepository.countByFollowingId(userId);
        int followingCnt = followRepository.countByFollowerId(userId);

        Boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(myId, userId);

        List<UserBadge> userBadgeList = userBadgeRepository.findByUserId(userId);
        List<ProfileBadgeDto> profileBadgeList =
                userBadgeList.stream()
                        .map(userBadge -> {
                            Badge badge = userBadge.getBadge();
                            return new ProfileBadgeDto(
                                    badge.getId(),
                                    badge.getName(),
                                    badge.getImage()
                            );
                        })
                        .collect(Collectors.toList());

        GetUserProfileResponse response = new GetUserProfileResponse(
                user.getId(), user.getNickName(), user.getProfileImage(),
                user.getMessage(), user.getLevel(), user.getExperience(),
                followerCnt, followingCnt, isFollowing, profileBadgeList
        );

        return response;
    }


    /**
     * 현재 사용자의 프로필 정보를 수정하는 메서드
     *
     * @param userId 수정할 사용자의 ID
     * @param request 수정할 프로필 정보
     * @param response HTTP 응답 객체
     * @return ResponseEntity<BaseResponse<Void>> 수정 결과 응답
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우 발생
     */
    @Override
    @Transactional
    public void updateMyProfile(
            Long userId, HttpServletRequest httpRequest, UpdateMyProfileRequest request, HttpServletResponse response
    ) throws IOException {

        if (request.getNickName() == null || request.getNickName().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "닉네임은 필수 입력값입니다.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "상태 메시지는 필수 입력값입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없음: " + userId));

        User existingUser = userRepository.findByNickName(request.getNickName());

        if (existingUser != null && !existingUser.getId().equals(userId)) {
            throw new CustomException(HttpStatus.CONFLICT, "닉네임이 이미 사용 중입니다.");
        }

        String existingProfileImageUrl = userRepository.findProfileImageByUserId(userId);
        String profileImageUrl = existingProfileImageUrl; // 기본적으로 기존 이미지 유지

        // 새 프로필 이미지가 들어왔을 때만 업데이트
        if (request.getProfileImageFile() != null && !request.getProfileImageFile().isEmpty()) {
            photoService.deleteProfileFile(existingProfileImageUrl); // 기존 이미지 삭제
            profileImageUrl = photoService.uploadProfileFile(request.getProfileImageFile());
        }

        // 기기 정보 가져오기
        String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
        String deviceType = getDeviceType(userAgent); // 기기 유형 판별
        String userKey = "refresh:" + userId + ":" + deviceType;

        // 새로운 액세스 및 리프레시 토큰 생성
        String newAccess = jwtUtil.createJwt("access", request.getNickName(), 600000L); // 10분 유효
        String newRefresh = jwtUtil.createJwt("refresh", request.getNickName(), 86400000L); // 1일 유효

        // Redis에 새 리프레시 토큰 저장
        redisUtil.setex(userKey, newRefresh, 86400L);

        // 클라이언트에 새 토큰 쿠키로 설정
        response.addCookie(createCookie("access", newAccess));
        response.addCookie(createCookie("refresh", newRefresh));

        user.updateProfile(request.getNickName(), profileImageUrl, request.getMessage());
        userRepository.save(user);
    }


    /**
     * 현재 사용자의 통계 정보를 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetMyStaticResponse>> 사용자 통계 정보 응답
     */
    @Override
    public GetMyStaticResponse getMyStatic(
            Long userId) {
        String activityWeek = gameWeekUtil.getCurrentGameWeek();
        // 평균 점수
        Map<String, Object> stats = timeAttackRepository.calculateStats(userId);
        float avgScore = stats.get("avgScore") != null ? ((Double) stats.get("avgScore")).floatValue() : 0f;

        // 타임어택 랭크
        List<TimeAttack> timeAttackList = timeAttackRepository.findHighestScoresAllUser(activityWeek);
        int timeAttackRank = 0;
        for (int i = 0; i < timeAttackList.size(); i++) {
            if (timeAttackList.get(i).getUser().getId().equals(userId)) {
                timeAttackRank = i + 1; // 등수는 1부터 시작
                break;
            }
        }

        // 아레나 랭크
        List<Arena> arenaList = arenaRepository.getRankAllUser(activityWeek);
        int arenaRank = 0;
        for (int ii = 0; ii < arenaList.size(); ii++) {
            if (arenaList.get(ii).getUser().getId().equals(userId)) {
                arenaRank = ii + 1; // 등수는 1부터 시작
                break;
            }
        }

        GetMyStaticResponse response = new GetMyStaticResponse(
                avgScore, timeAttackRank, arenaRank
        );

        return response;
    }


    /**
     * 특정 사용자의 통계 정보를 조회하는 메서드
     *
     * @param userId 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetUserStaticResponse>> 사용자 통계 정보 응답
     */
    @Override
    public GetUserStaticResponse getUserStatic(
            Long userId) {

        if (userId == null || userId <= 0) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자 ID입니다.");
        }
        String activityWeek = gameWeekUtil.getCurrentGameWeek();
        Map<String, Object> stats = timeAttackRepository.calculateStats(userId);
        float avgScore = stats.get("avgScore") != null ? ((Double) stats.get("avgScore")).floatValue() : 0f;

        List<TimeAttack> timeAttackList = timeAttackRepository.findHighestScoresAllUser(activityWeek);
        int rank = 0;
        for (int i = 0; i < timeAttackList.size(); i++) {
            if (timeAttackList.get(i).getUser().getId().equals(userId)) {
                rank = i + 1; // 등수는 1부터 시작
                break;
            }
        }

        // 아레나 랭크
        List<Arena> arenaList = arenaRepository.getRankAllUser(activityWeek);
        int arenaRank = 0;
        for (int ii = 0; ii < arenaList.size(); ii++) {
            if (arenaList.get(ii).getUser().getId().equals(userId)) {
                arenaRank = ii + 1; // 등수는 1부터 시작
                break;
            }
        }

        GetUserStaticResponse response = new GetUserStaticResponse(
                avgScore, rank, arenaRank
        );

        return response;
    }


    /**
     * 사용자 피드백을 저장합니다.
     *
     * @param request 피드백 저장 요청 객체
     */
    @Override
    @Transactional
    public void saveFeedback(
            SaveFeedbackRequest request) {

        if (request == null) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "요청 객체가 비어 있습니다.");
        }

        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "전화번호(phoneNumber)는 필수 입력값입니다.");
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "메시지(message)는 필수 입력값입니다.");
        }

        UserFeedback userFeedback = new UserFeedback(
                request.getPhoneNumber(), request.getMessage()
        );
        userFeedbackRepository.save(userFeedback);
    }


    /**
     * 쿠키를 생성합니다.
     *
     * @param key 쿠키 이름
     * @param value 쿠키 값
     * @return 생성된 Cookie 객체
     */
    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60 * 60 * 24); // 1일 유지
        cookie.setSecure(true); // HTTPS에서만 전송 (배포 환경에서는 필수)
        cookie.setHttpOnly(true); // JavaScript에서 접근 불가
        cookie.setPath("/"); // 모든 경로에서 접근 가능

        return cookie;
    }


    /**
     * User-Agent를 분석하여 기기 유형을 판별합니다.
     *
     * @param userAgent HTTP User-Agent 헤더 값
     * @return "pc" 또는 "mobile"
     */
    private String getDeviceType(String userAgent) {
        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "mobile";
        }
        return "pc";
    }
}
