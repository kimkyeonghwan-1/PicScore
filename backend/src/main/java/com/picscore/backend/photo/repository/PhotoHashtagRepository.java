package com.picscore.backend.photo.repository;

import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.photo.model.entity.PhotoHashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 사진-해시태그 매핑 관련 DB 작업을 처리하는 Repository
 */
@Repository
public interface PhotoHashtagRepository extends JpaRepository<PhotoHashtag, Long> {


    /**
     * 특정 사진 ID에 해당하는 해시태그 목록을 조회합니다.
     *
     * @param photoId 조회할 사진의 ID
     * @return 해당 사진에 연결된 해시태그 목록
     */
    List<PhotoHashtag> findByPhotoId(Long photoId);
}

