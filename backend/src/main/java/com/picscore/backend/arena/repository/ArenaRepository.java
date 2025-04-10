package com.picscore.backend.arena.repository;

import com.picscore.backend.arena.model.entity.Arena;
import com.picscore.backend.timeattack.model.entity.TimeAttack;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Arena 엔티티와 관련된 데이터베이스 작업을 수행하는 JPA 레포지토리 인터페이스
 */
@Repository
public interface ArenaRepository extends JpaRepository<Arena, Long> {


    /**
     * 특정 사용자 ID에 해당하는 Arena 엔티티를 조회
     *
     * @param userId 조회할 사용자 ID
     * @return Optional<Arena> 해당 사용자의 Arena 정보
     */
    Optional<Arena> findByUserId(Long userId);


    /**
     * 특정 활동 주차에 해당하는 모든 사용자의 Arena 데이터를 점수와 갱신 시간 기준으로 내림차순 정렬하여 조회
     *
     * @param activityWeek 활동 주차(예: "2025-W15")
     * @return List<Arena> 정렬된 사용자 Arena 정보 목록
     */
    @Query(value = """
        SELECT a FROM Arena a
        WHERE a.activityWeek = :activityWeek
        ORDER BY a.score DESC, a.updatedAt DESC
    """)
    List<Arena> getRankAllUser(@Param("activityWeek") String activityWeek);


    /**
     * 특정 활동 주차의 사용자별 최고 점수 정보를 페이지 단위로 조회
     * 점수 내림차순 → 최근 업데이트 순으로 정렬되며, 사용자 중복 없이 최대 점수를 기준으로 반환
     *
     * @param activityWeek 활동 주차
     * @param pageable 페이지 요청 정보
     * @return Page<Arena> 사용자별 최고 점수에 대한 Arena 정보 페이지
     */
    @Query(value = """
            SELECT a FROM Arena a
            WHERE a.activityWeek = :activityWeek              
            ORDER BY a.score DESC, a.updatedAt DESC
            """,
            countQuery = "SELECT COUNT(DISTINCT a.user) FROM Arena a")
    Page<Arena> getHighestScoresPerUser(@Param("activityWeek") String activityWeek, Pageable pageable);
}

