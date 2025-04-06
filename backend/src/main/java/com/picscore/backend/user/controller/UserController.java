package com.picscore.backend.user.controller;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.timeattack.model.response.GetMyStaticResponse;
import com.picscore.backend.timeattack.model.response.GetUserStaticResponse;
import com.picscore.backend.user.model.request.SaveFeedbackRequest;
import com.picscore.backend.user.model.request.UpdateMyProfileRequest;
import com.picscore.backend.user.model.response.GetMyFollowersResponse;
import com.picscore.backend.user.model.response.GetMyFollowingsResponse;
import com.picscore.backend.user.model.response.GetUserFollowersResponse;
import com.picscore.backend.user.model.response.GetUserFollowingsResponse;
import com.picscore.backend.user.model.request.ToggleFollowRequest;
import com.picscore.backend.user.model.response.*;
import com.picscore.backend.user.service.FollowService;
import com.picscore.backend.user.service.OAuthService;
import com.picscore.backend.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * 사용자 관련 API를 처리하는 컨트롤러
 * - 사용자 정보 조회
 * - 로그아웃 처리
 */
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FollowService followService;
    private final OAuthService oAuthService;


    /**
     * 현재 로그인한 사용자의 정보를 반환합니다.
     * <p>
     * 이 API는 요청의 쿠키에서 액세스 토큰을 추출하여 사용자 정보를 조회합니다.
     *
     * @param request HTTP 요청 객체 (쿠키에서 토큰 추출)
     * @return ResponseEntity<BaseResponse < UserLoginResponse>>
     * - 사용자 정보를 포함하는 응답 객체
     */
    @GetMapping("/info")
    public ResponseEntity<BaseResponse<LoginInfoResponse>> LoginInfo(
            HttpServletRequest request) {

        LoginInfoResponse loginInfoResponse = userService.LoginInfo(request);

        return ResponseEntity.ok(BaseResponse.success("로그인 성공", loginInfoResponse));
    }


    /**
     * 사용자 로그아웃을 처리합니다.
     * <p>
     * 이 API는 클라이언트를 로그아웃 페이지로 리다이렉트하고,
     * 로그아웃 완료 메시지를 반환합니다.
     *
     * @param response HTTP 응답 객체
     * @return ResponseEntity<BaseResponse < Void>>
     * - 로그아웃 완료 메시지를 포함하는 응답 객체
     * @throws IOException 리다이렉트 중 발생할 수 있는 입출력 예외
     */
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> redirectToGoogleLogout(
            HttpServletResponse response) throws IOException {

//        response.sendRedirect("/logout");
        BaseResponse<Void> baseResponse = BaseResponse.withMessage("로그아웃 완료");
        return ResponseEntity.ok(baseResponse);
    }


    /**
     * 현재 사용자의 팔로우 상태를 토글하는 엔드포인트
     *
     * @param toggleFollowRequest 팔로우 대상 사용자의 ID를 포함한 요청 객체
     * @param request             HTTP 요청 객체
     * @return ResponseEntity<BaseResponse < Void>> 팔로우 상태 변경 결과 메시지
     */
    @PostMapping("/following/me")
    public ResponseEntity<BaseResponse<Void>> toggleFollow(
            @RequestBody ToggleFollowRequest toggleFollowRequest,
            HttpServletRequest request) {

        Long followerId = oAuthService.findIdByNickName(request);
        Boolean follow = followService.toggleFollow(followerId, toggleFollowRequest.getFollowingId());

        BaseResponse<Void> baseResponse = follow ?
                BaseResponse.withMessage("팔로잉 추가 완료") :
                BaseResponse.withMessage("팔로잉 취소 완료");

        return ResponseEntity.ok(baseResponse);
    }


    /**
     * 현재 사용자의 팔로워 목록을 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체
     * @return ResponseEntity<BaseResponse < GetMyFollowersResponse>> 팔로워 목록 정보
     */
    @GetMapping("/follower/me")
    public ResponseEntity<BaseResponse<List<GetMyFollowersResponse>>> getMyFollowers(
            HttpServletRequest request) {

        Long userId = oAuthService.findIdByNickName(request);
        List<GetMyFollowersResponse> getMyFollowersResponseList = followService.getMyFollowers(userId);

        return ResponseEntity.ok(BaseResponse.success("팔로워 조회 성공", getMyFollowersResponseList));
    }


    /**
     * 현재 사용자의 팔로잉 목록을 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체
     * @return ResponseEntity<BaseResponse < GetMyFollowersResponse>> 팔로잉 목록 정보
     */
    @GetMapping("/following/me")
    public ResponseEntity<BaseResponse<List<GetMyFollowingsResponse>>> getMyFollowings(HttpServletRequest request) {

        Long userId = oAuthService.findIdByNickName(request);
        List<GetMyFollowingsResponse> getMyFollowingsResponseList = followService.getMyFollowings(userId);

        return ResponseEntity.ok(BaseResponse.success("팔로잉 조회 성공", getMyFollowingsResponseList));
    }


    /**
     * 특정 사용자의 팔로워 목록을 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @param userId  팔로워를 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse < List < GetUserFollowersResponse>>> 팔로워 목록 응답
     */
    @GetMapping("/follower/{userId}")
    public ResponseEntity<BaseResponse<List<GetUserFollowersResponse>>> getUserFollowers(
            HttpServletRequest request,
            @PathVariable Long userId) {

        Long myId = oAuthService.findIdByNickName(request);
        List<GetUserFollowersResponse> getUserFollowersResponseList = followService.getUserFollowers(myId, userId);

        return ResponseEntity.ok(BaseResponse.success("팔로워 조회 성공", getUserFollowersResponseList));
    }


    /**
     * 특정 사용자의 팔로잉 목록을 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @param userId  팔로잉을 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse < List < GetUserFollowingsResponse>>> 팔로잉 목록 응답
     */
    @GetMapping("/following/{userId}")
    public ResponseEntity<BaseResponse<List<GetUserFollowingsResponse>>> getUserFollowings(
            HttpServletRequest request,
            @PathVariable Long userId
    ) {

        Long myId = oAuthService.findIdByNickName(request);
        List<GetUserFollowingsResponse> getUserFollowingsResponseList = followService.getUserFollowings(myId, userId);

        return ResponseEntity.ok(BaseResponse.success("팔로잉 조회 성공", getUserFollowingsResponseList));
    }


    /**
     * 현재 사용자의 팔로워를 삭제하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @param userId  삭제할 팔로워의 ID
     * @return ResponseEntity<BaseResponse < Void>> 삭제 결과 응답
     */
    @DeleteMapping("/follower/{userId}")
    public ResponseEntity<BaseResponse<Void>> deleteMyFollower(
            HttpServletRequest request,
            @PathVariable Long userId
    ) {

        Long myId = oAuthService.findIdByNickName(request);
        followService.deleteMyFollower(myId, userId);

        return ResponseEntity.ok(BaseResponse.withMessage("팔로워 삭제 완료"));
    }


    /**
     * 사용자를 검색하는 엔드포인트
     *
     * @param searchText 검색어 텍스트
     * @return ResponseEntity<BaseResponse < List < SearchUsersResponse>>> 검색 결과 응답
     */
    @GetMapping("/search/{searchText}")
    public ResponseEntity<BaseResponse<List<SearchUsersResponse>>> searchUser(
            @PathVariable String searchText
    ) {

        List<SearchUsersResponse> searchUsersResponseList = userService.searchUser(searchText);

        return ResponseEntity.ok(BaseResponse.success("친구 검색 성공", searchUsersResponseList));
    }


    /**
     * 현재 사용자의 프로필 정보를 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @return ResponseEntity<BaseResponse < GetMyProfileResponse>> 현재 사용자 프로필 정보 응답
     */
    @GetMapping("/profile/me")
    public ResponseEntity<BaseResponse<GetMyProfileResponse>> getMyProfile(
            HttpServletRequest request
    ) {

        Long userId = oAuthService.findIdByNickName(request);
        GetMyProfileResponse getMyProfileResponse = userService.getMyProfile(userId);

        return ResponseEntity.ok(BaseResponse.success("내 프로필 조회 성공", getMyProfileResponse));
    }


    /**
     * 특정 사용자의 프로필 정보를 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @param userId  프로필을 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse < GetUserProfileResponse>> 사용자 프로필 정보 응답
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<BaseResponse<GetUserProfileResponse>> getUserProfile(
            HttpServletRequest request,
            @PathVariable Long userId
    ) {

        Long myId = oAuthService.findIdByNickName(request);
        GetUserProfileResponse getUserProfileResponse = userService.getUserProfile(myId, userId);

        return ResponseEntity.ok(BaseResponse.success("유저 프로필 조회 성공", getUserProfileResponse));
    }


    /**
     * 현재 사용자의 프로필 정보를 수정하는 엔드포인트
     *
     * @param response               HTTP 응답 객체
     * @param request                HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @param updateMyProfileRequest 수정할 프로필 정보
     * @return ResponseEntity<BaseResponse < Void>> 수정 결과 응답
     */
    @PatchMapping("/profile")
    public ResponseEntity<BaseResponse<Void>> updateMyProfile(
            HttpServletResponse response,
            HttpServletRequest request,
            @ModelAttribute UpdateMyProfileRequest updateMyProfileRequest
    ) throws IOException {

        Long userId = oAuthService.findIdByNickName(request);
        userService.updateMyProfile(userId, request, updateMyProfileRequest, response);

        return ResponseEntity.ok(BaseResponse.withMessage("프로필 수정 완료"));
    }


    /**
     * 현재 사용자의 통계 정보를 조회하는 엔드포인트
     *
     * @param request HTTP 요청 객체 (현재 사용자 인증 정보 포함)
     * @return ResponseEntity<BaseResponse < GetMyStaticResponse>> 현재 사용자 통계 정보 응답
     */
    @GetMapping("/static/me")
    public ResponseEntity<BaseResponse<GetMyStaticResponse>> getMyStatic(
            HttpServletRequest request
    ) {

        Long userId = oAuthService.findIdByNickName(request);
        GetMyStaticResponse getMyStaticResponse = userService.getMyStatic(userId);

        return ResponseEntity.ok(BaseResponse.success("나의 통계 조회 성공", getMyStaticResponse));
    }


    /**
     * 특정 사용자의 통계 정보를 조회하는 엔드포인트
     *
     * @param userId 통계를 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse < GetUserStaticResponse>> 사용자 통계 정보 응답
     */
    @GetMapping("/static/{userId}")
    public ResponseEntity<BaseResponse<GetUserStaticResponse>> getUserStatic(
            @PathVariable Long userId
    ) {

        GetUserStaticResponse getUserStaticResponse = userService.getUserStatic(userId);

        return ResponseEntity.ok(BaseResponse.success("유저의 통계 조회 성공", getUserStaticResponse));
    }

    @PostMapping("/chicken/request")
    public ResponseEntity<BaseResponse<Void>> saveFeedback(
            @RequestBody SaveFeedbackRequest request) {

        userService.saveFeedback(request);

        return ResponseEntity.ok(BaseResponse.withMessage("피드백 저장 완료"));
    }
}
