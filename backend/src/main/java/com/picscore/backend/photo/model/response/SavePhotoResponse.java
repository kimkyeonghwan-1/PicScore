package com.picscore.backend.photo.model.response;

import lombok.Data;

@Data
public class SavePhotoResponse {
    private Long id;

    public SavePhotoResponse(Long id) {
        this.id = id;
    }
}

