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

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    @Query("SELECT new com.picscore.backend.photo.model.response.GetPhotosResponse(p.id, p.imageUrl) " +
            "FROM Photo p " +
            "JOIN PhotoHashtag ph ON p.id = ph.photo.id " +
            "JOIN Hashtag h ON ph.hashtag.id = h.id " +
            "WHERE h.name LIKE CONCAT('%', :keyword, '%') AND p.isPublic = true")
    List<GetPhotosResponse> findPhotosByHashtagName(@Param("keyword") String keyword);

    @Query("SELECT p FROM Photo p  WHERE p.user.id = :userId AND p.isPublic = :isPublic")
    List<Photo> findPhotosByUserId(@Param("userId") Long userId, @Param("isPublic") Boolean isPublic);

    Photo findPhotoById(Long id);

    @Query(value = "SELECT p FROM Photo p WHERE p.isPublic = true",
            countQuery = "SELECT COUNT(p) FROM Photo p WHERE p.isPublic = true")
    Page<Photo> findAllWithPublic(Pageable pageable);


    @Modifying
    @Transactional
    @Query("UPDATE Photo p SET p.isPublic = NOT p.isPublic WHERE p.id = :id")
    void togglePublic(@Param("id") Long id);

    @Query("SELECT p, COUNT(pl) " +
            "FROM Photo p " +
            "LEFT JOIN PhotoLike pl ON p.id = pl.photo.id " +
            "WHERE p.isPublic = true " + // ← 공개 사진만 필터링
            "GROUP BY p.id " +
            "ORDER BY COUNT(pl) DESC, p.createdAt DESC") // ← 동점시 최신순
    List<Object[]> findTop5PhotosWithLikeCount(Pageable pageable);
}
