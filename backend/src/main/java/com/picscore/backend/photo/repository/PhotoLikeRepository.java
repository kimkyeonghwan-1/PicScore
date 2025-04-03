package com.picscore.backend.photo.repository;

import com.picscore.backend.photo.model.entity.PhotoLike;
import com.picscore.backend.user.model.entity.Follow;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoLikeRepository extends JpaRepository<PhotoLike, Long> {
    int countByPhotoId(Long photoId); // 특정 사진의 좋아요 수를 계산하는 메서드

    Optional<PhotoLike> findByPhotoIdAndUserId(Long photoId, Long userId);

    Boolean existsByPhotoIdAndUserId(Long photoId, Long userId);

    // 특정 사진 ID 리스트 중 좋아요 개수가 10개 이상인 사진이 존재하는지 확인
    @Query("""
    SELECT COUNT(pl.photo.id) > 0 
    FROM PhotoLike pl 
    WHERE pl.photo.id IN :photoIds 
    GROUP BY pl.photo.id 
    HAVING COUNT(pl.photo.id) >= 10
    """)
    Boolean existsByPhotoIdInAndLikeCountGreaterThanEqual(@Param("photoIds") List<Long> photoIds);


}
