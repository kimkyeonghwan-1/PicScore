package com.picscore.backend.badge.repository;

import com.picscore.backend.badge.model.entity.Badge;
import com.picscore.backend.badge.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    Boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    List<UserBadge> findByUserId(Long userId);
}
