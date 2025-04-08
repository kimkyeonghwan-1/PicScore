package com.picscore.backend.arena.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ArenaPhotoResponse {
    private Long photoId;
    private int score;
    private String imageUrl;
}
