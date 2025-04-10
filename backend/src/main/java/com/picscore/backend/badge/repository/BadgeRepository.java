package com.picscore.backend.badge.repository;

import com.picscore.backend.badge.model.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Badge 엔티티와 관련된 데이터베이스 작업을 수행하는 JPA 레포지토리 인터페이스
 */
public interface BadgeRepository extends JpaRepository<Badge, Long> {


    /**
     * 배지 이름을 기준으로 배지를 조회
     *
     * @param name 조회할 배지 이름
     * @return Optional<Badge> 이름에 해당하는 배지 정보
     */
    Optional<Badge> findByName(String name);
}

