package com.picscore.backend.user.model.response;

import com.picscore.backend.badge.model.dto.ProfileBadgeDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GetUserProfileResponse {

    private Long userId;
    private String nickName;
    private String profileImage;
    private String message;
    private int level;
    private int experience;
    private int followerCnt;
    private int followingCnt;
    private Boolean isFollowing;
    private List<ProfileBadgeDto> badgeList;
}
