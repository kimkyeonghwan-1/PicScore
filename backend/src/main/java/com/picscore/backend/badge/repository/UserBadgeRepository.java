package com.picscore.backend.badge.repository;

import com.picscore.backend.badge.model.entity.Badge;
import com.picscore.backend.badge.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * UserBadge 엔티티와 관련된 데이터베이스 작업을 수행하는 JPA 레포지토리 인터페이스
 */
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {


    /**
     * 특정 사용자 ID와 배지 ID를 기반으로 해당 배지를 사용자가 획득했는지 여부를 확인
     *
     * @param userId 사용자 ID
     * @param badgeId 배지 ID
     * @return Boolean 해당 배지를 사용자가 보유하고 있는지 여부
     */
    Boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);


    /**
     * 특정 사용자 ID에 해당하는 모든 사용자-배지(UserBadge) 목록을 조회
     *
     * @param userId 사용자 ID
     * @return List<UserBadge> 해당 사용자가 획득한 모든 배지 목록
     */
    List<UserBadge> findByUserId(Long userId);


    /**
     * 특정 사용자가 획득한 배지 개수를 조회
     *
     * @param userId 사용자 ID
     * @return int 획득한 배지 수
     */
    int countByUserId(Long userId);
}

