package com.picscore.backend.user.service;

import com.picscore.backend.timeattack.model.response.GetMyStaticResponse;
import com.picscore.backend.timeattack.model.response.GetUserStaticResponse;
import com.picscore.backend.user.model.response.*;
import com.picscore.backend.user.model.request.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

/**
 * 유저(User) 관련 기능을 정의한 인터페이스입니다.
 * 구현체는 UserServiceImpl 입니다.
 */
public interface UserService {


    /**
     * 로그인한 사용자의 정보를 반환합니다.
     */
    LoginInfoResponse LoginInfo(HttpServletRequest request);


    /**
     * 사용자 닉네임으로 사용자 목록을 검색합니다.
     */
    List<SearchUsersResponse> searchUser(String searchText);


    /**
     * 내 프로필 정보를 반환합니다.
     */
    GetMyProfileResponse getMyProfile(Long userId);


    /**
     * 다른 사용자의 프로필 정보를 반환합니다.
     */
    GetUserProfileResponse getUserProfile(Long myId, Long userId);


    /**
     * 내 프로필을 수정합니다.
     */
    void updateMyProfile(Long userId, HttpServletRequest request, UpdateMyProfileRequest updateRequest, HttpServletResponse response) throws IOException;


    /**
     * 내 통계 정보를 가져옵니다.
     */
    GetMyStaticResponse getMyStatic(Long userId);


    /**
     * 다른 사용자의 통계 정보를 가져옵니다.
     */
    GetUserStaticResponse getUserStatic(Long userId);


    /**
     * 사용자 피드백을 저장합니다.
     */
    void saveFeedback(SaveFeedbackRequest request);
}
