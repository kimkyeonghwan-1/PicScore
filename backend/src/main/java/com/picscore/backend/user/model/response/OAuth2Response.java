package com.picscore.backend.user.model.response;

public interface OAuth2Response {

    // 제공자 (Ex. google, kakao, ...)
    String getProvider();

    // 제공자에서 발급해주는 아이디 (번호)
    String getProviderId();

    // 사용자 실명 (설정한 이름)
    String getName();

    // 사용자 프로필 사진
    String getProfileImage();
}
