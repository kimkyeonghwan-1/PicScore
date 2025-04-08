package com.picscore.backend.user.model.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@AllArgsConstructor
public class UserDto {

    private String socialId;
    private String nickName;
    private String role;
    private Boolean fistUser;
}
