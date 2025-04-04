package com.picscore.backend.arena.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ArenaRankingResponse {

    private Long userId;
    private String nickName;
    private String profileImage;
    private int score;
}



