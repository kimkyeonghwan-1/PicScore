package com.picscore.backend.user.repository;

import com.picscore.backend.user.model.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * 사용자(User) 관련 DB 접근을 담당하는 레포지토리
 */
public interface UserRepository extends JpaRepository<User, Long> {


    /**
     * 소셜 ID로 사용자 엔티티를 조회합니다.
     *
     * @param socialId 소셜 로그인 ID
     * @return User 엔티티
     */
    User findBySocialId(String socialId);


    /**
     * 닉네임으로 사용자 엔티티를 조회합니다.
     *
     * @param nickName 닉네임
     * @return User 엔티티
     */
    User findByNickName(String nickName);


    /**
     * 닉네임으로 사용자 ID를 조회합니다.
     *
     * @param nickName 닉네임
     * @return 사용자 ID
     */
    @Query("SELECT u.id FROM User u WHERE u.nickName = :nickName")
    Long findIdByNickName(@Param("nickName") String nickName);


    /**
     * 닉네임에 특정 문자열이 포함된 사용자를 조회합니다.
     *
     * @param searchText 검색어
     * @return 닉네임이 검색어를 포함하는 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.nickName LIKE %:searchText%")
    List<User> findByNickNameContaining(@Param("searchText") String searchText);


    /**
     * 소셜 ID로 닉네임을 조회합니다.
     *
     * @param socialId 소셜 로그인 ID
     * @return 닉네임
     */
    @Query("SELECT u.nickName FROM User u WHERE u.socialId = :socialId")
    String findNickNameBySocialId(@Param("socialId") String socialId);


    /**
     * 사용자 ID로 프로필 이미지를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 프로필 이미지 URL
     */
    @Query("SELECT u.profileImage FROM User u WHERE u.id = :userId")
    String findProfileImageByUserId(@Param("userId") Long userId);


    /**
     * 사용자 ID로 경험치 값을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 경험치
     */
    @Query("SELECT u.experience FROM User u WHERE u.id = :userId")
    int findExperienceByUserId(@Param("userId") Long userId);
}

