package com.picscore.backend.user.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponse {
    private Long id;
    private String nickname;
    private String accessToken;
}
