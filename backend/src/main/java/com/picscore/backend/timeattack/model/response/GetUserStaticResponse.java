package com.picscore.backend.timeattack.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetUserStaticResponse {

    private float scoreAvg;
    private int timeAttackRank;
    private int arenaRank;
}
