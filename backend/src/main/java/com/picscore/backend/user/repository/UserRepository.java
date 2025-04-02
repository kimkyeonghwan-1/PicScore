package com.picscore.backend.user.repository;

import com.picscore.backend.user.model.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Boolean existsBySocialId(String socialId);

    User findBySocialId(String socialId);

    User findByNickName(String nickName);

    @Query("SELECT u.id FROM User u WHERE u.nickName = :nickName")
    Long findIdByNickName(@Param("nickName") String nickName);

    @Query("SELECT u FROM User u WHERE u.nickName LIKE %:searchText%")
    List<User> findByNickNameContaining(@Param("searchText") String searchText);

    @Query("SELECT u.nickName FROM User u WHERE u.socialId = :socialId")
    String findNickNameBySocialId(@Param("socialId") String socialId);

    Boolean existsByNickName(String nickName);

    @Query("SELECT u.profileImage FROM User u WHERE u.id = :userId")
    String findProfileImageByUserId(@Param("userId") Long userId);

    @Query("SELECT u.experience FROM User u WHERE u.id = :userId")
    int findExperienceByUserId(@Param("userId") Long userId);

}
