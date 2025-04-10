package com.picscore.backend.photo.repository;

import com.picscore.backend.photo.model.entity.PhotoLike;
import com.picscore.backend.user.model.entity.Follow;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사진 좋아요 관련 DB 작업을 처리하는 Repository
 */
@Repository
public interface PhotoLikeRepository extends JpaRepository<PhotoLike, Long> {


    /**
     * 특정 사진의 좋아요 수를 계산합니다.
     *
     * @param photoId 사진 ID
     * @return 좋아요 수
     */
    int countByPhotoId(Long photoId);


    /**
     * 특정 사진에 대해 특정 유저가 누른 좋아요 정보를 조회합니다.
     *
     * @param photoId 사진 ID
     * @param userId 유저 ID
     * @return PhotoLike 정보
     */
    Optional<PhotoLike> findByPhotoIdAndUserId(Long photoId, Long userId);


    /**
     * 특정 유저가 특정 사진을 좋아요 했는지 여부를 확인합니다.
     *
     * @param photoId 사진 ID
     * @param userId 유저 ID
     * @return 좋아요 여부 (true/false)
     */
    Boolean existsByPhotoIdAndUserId(Long photoId, Long userId);


    /**
     * 주어진 사진 ID 리스트 중 좋아요 수가 10개 이상인 사진이 존재하는지 확인합니다.
     *
     * @param photoIds 사진 ID 리스트
     * @return 조건을 만족하는 사진이 하나라도 있으면 true, 아니면 false
     */
    @Query("""
    SELECT COUNT(pl.photo.id) > 0 
    FROM PhotoLike pl 
    WHERE pl.photo.id IN :photoIds 
    GROUP BY pl.photo.id 
    HAVING COUNT(pl.photo.id) >= 10
    """)
    Boolean existsByPhotoIdInAndLikeCountGreaterThanEqual(@Param("photoIds") List<Long> photoIds);
}

