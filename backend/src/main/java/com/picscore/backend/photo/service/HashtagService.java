package com.picscore.backend.photo.service;

import com.picscore.backend.photo.model.entity.Photo;

import java.util.List;

/**
 * 해시태그 관련 비즈니스 로직을 처리하는 서비스 인터페이스
 */
public interface HashtagService {

    /**
     * 사진에 해시태그를 연결하여 저장하는 메서드
     */
    void saveHashtags(Photo photo, List<String> hashtags);
}