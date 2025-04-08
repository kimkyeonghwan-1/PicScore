package com.picscore.backend.photo.service.impl;

import com.picscore.backend.photo.model.entity.Hashtag;
import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.photo.model.entity.PhotoHashtag;
import com.picscore.backend.photo.repository.HashtagRepository;
import com.picscore.backend.photo.repository.PhotoHashtagRepository;
import com.picscore.backend.photo.service.HashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HashtagServiceImpl implements HashtagService {
    private final HashtagRepository hashtagRepository;
    private final PhotoHashtagRepository photoHashtagRepository;


    /**
     * 사진에 해시태그를 연결하여 저장하는 메서드
     *
     * @param photo 해시태그를 연결할 사진 엔티티
     * @param hashtags 저장할 해시태그 이름 목록
     * @throws IllegalArgumentException photo가 null인 경우 발생
     */
    @Transactional
    @Override
    public void saveHashtags(Photo photo, List<String> hashtags) {
        if (hashtags != null && !hashtags.isEmpty()) {
            for (String tagName : hashtags) {
                Hashtag hashtag = hashtagRepository.findByName(tagName)
                        .orElseGet(() -> hashtagRepository.save(new Hashtag(tagName)));

                photoHashtagRepository.save(new PhotoHashtag(photo, hashtag));
            }
        }
    }
}

