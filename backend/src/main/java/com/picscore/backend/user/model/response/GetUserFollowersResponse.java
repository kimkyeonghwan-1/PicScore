package com.picscore.backend.user.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetUserFollowersResponse {

    private Long userId;
    private String profileImage;
    private String nickName;
    private Boolean isFollowing;
}
