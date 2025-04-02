package com.picscore.backend.badge.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetBadgeResponse {

    private Long badgeId;
    private String name;
    private String image;
    private String obtainCondition;
    private Boolean isObtain;
}
