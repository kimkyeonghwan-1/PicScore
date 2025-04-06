package com.picscore.backend.timeattack.model.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GetMyStaticResponse {

    private float scoreAvg;
    private int timeAttackRank;
    private int arenaRank;
}
