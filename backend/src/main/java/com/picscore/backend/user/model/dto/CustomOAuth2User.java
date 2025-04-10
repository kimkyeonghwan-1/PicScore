package com.picscore.backend.user.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {

    private final UserDto userDto;


    /**
     * OAuth2User의 속성을 반환합니다.
     * 이 구현에서는 사용하지 않으므로 null을 반환합니다.
     *
     * @return null
     */
    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }


    /**
     * 사용자의 권한 목록을 반환합니다.
     *
     * @return 사용자의 권한을 포함하는 Collection
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();

        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return userDto.getRole();
            }
        });

        return collection;
    }


    /**
     * 사용자의 이름(여기서는 닉네임)을 반환합니다.
     *
     * @return 사용자의 닉네임
     */
    @Override
    public String getName() {
        return userDto.getNickName();
    }


    /**
     * 사용자의 소셜ID를 반환합니다.
     *
     * @return 사용자의 소셜ID
     */
    public String getSocialId() {
        return userDto.getSocialId();
    }


    /**
     * 첫 사용자인지 여부를 반환합니다.
     *
     * @return 첫 사용자 여부
     */
    public Boolean getFistUser() { return userDto.getFistUser(); }
}

