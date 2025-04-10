package com.picscore.backend.photo.repository;

import com.picscore.backend.photo.model.entity.Photo;
import com.picscore.backend.photo.model.response.GetPhotosResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Map;

/**
 * 사진 관련 DB 작업을 처리하는 Repository
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {


    /**
     * 특정 해시태그를 포함하며 공개된 사진을 검색합니다.
     *
     * @param keyword 해시태그 키워드
     * @return 검색된 사진 리스트
     */
    @Query("SELECT new com.picscore.backend.photo.model.response.GetPhotosResponse(p.id, p.imageUrl) " +
            "FROM Photo p " +
            "JOIN PhotoHashtag ph ON p.id = ph.photo.id " +
            "JOIN Hashtag h ON ph.hashtag.id = h.id " +
            "WHERE h.name LIKE CONCAT('%', :keyword, '%') AND p.isPublic = true")
    List<GetPhotosResponse> findPhotosByHashtagName(@Param("keyword") String keyword);


    /**
     * 특정 유저의 사진 중 공개 여부 조건에 맞는 사진을 최신순으로 조회합니다.
     *
     * @param userId 유저 ID
     * @param isPublic 공개 여부
     * @return 사진 리스트
     */
    @Query("SELECT p FROM Photo p WHERE p.user.id = :userId AND p.isPublic = :isPublic ORDER BY p.createdAt DESC")
    List<Photo> findPhotosByUserId(@Param("userId") Long userId, @Param("isPublic") Boolean isPublic);


    /**
     * 사진 ID로 사진을 조회합니다.
     *
     * @param id 사진 ID
     * @return 해당 사진
     */
    Photo findPhotoById(Long id);


    /**
     * 공개된 모든 사진을 페이지네이션하여 조회합니다.
     *
     * @param pageable 페이지 정보
     * @return 공개 사진 페이지
     */
    @Query(value = "SELECT p FROM Photo p WHERE p.isPublic = true",
            countQuery = "SELECT COUNT(p) FROM Photo p WHERE p.isPublic = true AND p.photoType = 'article'")
    Page<Photo> findAllWithPublic(Pageable pageable);


    /**
     * 좋아요 수를 기준으로 공개 사진을 내림차순 정렬하여 조회합니다.
     *
     * @param pageable 페이지 정보
     * @return 좋아요 많은 순으로 정렬된 사진 페이지
     */
    @Query(
            value = """
        SELECT p FROM Photo p
        LEFT JOIN PhotoLike pl ON pl.photo.id = p.id
        WHERE p.isPublic = true
        GROUP BY p
        ORDER BY COUNT(pl) DESC
    """,
            countQuery = """
        SELECT COUNT(DISTINCT p) FROM Photo p
        WHERE p.isPublic = true AND p.photoType = 'article'
    """
    )
    Page<Photo> findAllOrderByLikeCount(Pageable pageable);


    /**
     * 특정 사진의 공개 여부를 토글합니다.
     *
     * @param id 사진 ID
     */
    @Modifying
    @Transactional
    @Query("UPDATE Photo p SET p.isPublic = CASE WHEN p.isPublic = true THEN false ELSE true END WHERE p.id = :id")
    void togglePublic(@Param("id") Long id);


    /**
     * 공개된 사진 중 좋아요 수가 많은 순으로 정렬하여 최대 5개의 사진과 좋아요 수를 반환합니다.
     * 동점일 경우 최신순으로 정렬합니다.
     *
     * @param pageable 페이지 정보
     * @return 사진과 좋아요 수 목록
     */
    @Query("SELECT p, COUNT(pl) " +
            "FROM Photo p " +
            "LEFT JOIN PhotoLike pl ON p.id = pl.photo.id " +
            "WHERE p.isPublic = true " +
            "GROUP BY p.id " +
            "ORDER BY COUNT(pl) DESC, p.createdAt DESC")
    List<Object[]> findTop5PhotosWithLikeCount(Pageable pageable);


    /**
     * 중복되지 않는 점수(score)를 기준으로 공개된 사진 4장을 랜덤하게 가져옵니다.
     *
     * @return 사진 ID, 점수, 이미지 URL 목록
     */
    @Query(value = "SELECT photo_id, score, image_url FROM ( " +
            "    SELECT p.photo_id, p.score, p.image_url, " +
            "           ROW_NUMBER() OVER (PARTITION BY p.score ORDER BY RAND()) AS rn " +
            "    FROM photo p " +
            "    WHERE p.is_public = 1 AND p.photo_type = 'article' " +
            ") AS sub " +
            "WHERE sub.rn = 1 " +
            "ORDER BY RAND() " +
            "LIMIT 4", nativeQuery = true)
    List<Object[]> getRandomPublicPhotos();


    /**
     * 특정 유저가 업로드한 사진 개수를 반환합니다.
     *
     * @param userId 유저 ID
     * @return 사진 개수
     */
    int countByUserId(Long userId);


    /**
     * 특정 유저가 특정 점수 이상의 사진을 올린 적이 있는지 확인합니다.
     *
     * @param userId 유저 ID
     * @param score 기준 점수
     * @return 존재 여부
     */
    Boolean existsByUserIdAndScoreGreaterThanEqual(Long userId, Float score);


    /**
     * 특정 유저가 업로드한 모든 사진을 조회합니다.
     *
     * @param userId 유저 ID
     * @return 사진 목록
     */
    List<Photo> findByUserId(Long userId);


    /**
     * 특정 유저가 업로드한 모든 사진의 ID 목록을 조회합니다.
     *
     * @param userId 유저 ID
     * @return 사진 ID 리스트
     */
    @Query("SELECT p.id FROM Photo p WHERE p.user.id = :userId")
    List<Long> findPhotoIdsByUserId(@Param("userId") Long userId);


    /**
     * 특정 유저가 업로드한 사진들의 평균 점수를 계산합니다.
     *
     * @param userId 유저 ID
     * @return 평균 점수
     */
    @Query("SELECT " +
            "AVG(p.score) as avgScore " +
            "FROM Photo p " +
            "WHERE p.user.id = :userId")
    Map<String, Object> calculateStats(@Param("userId") Long userId);
}

