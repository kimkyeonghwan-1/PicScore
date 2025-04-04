package com.picscore.backend.arena.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResultArenaRequest {
    private int correct;
    private String time;
}
