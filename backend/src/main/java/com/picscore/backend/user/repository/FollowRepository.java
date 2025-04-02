package com.picscore.backend.user.repository;

import com.picscore.backend.user.model.entity.Follow;
import com.picscore.backend.user.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    List<Follow> findByFollowingId(Long followingId);

    List<Follow> findByFollowerId(Long followerId);

    Boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    int countByFollowingId(Long followingId);

    int countByFollowerId(Long followerId);

}
