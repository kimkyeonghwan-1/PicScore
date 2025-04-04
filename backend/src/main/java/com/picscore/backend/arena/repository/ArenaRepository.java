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

@Repository
public interface ArenaRepository extends JpaRepository<Arena, Long> {

    Optional<Arena> findByUserId(Long userId);

    @Query(value = """
        SELECT a FROM Arena a
        WHERE a.activityWeek = :activityWeek
        ORDER BY a.score DESC, a.updatedAt DESC
    """)
    List<Arena> getRankAllUser(@Param("activityWeek") String activityWeek);

    @Query(value = """
            SELECT a FROM Arena a
            WHERE a.activityWeek = :activityWeek              
            ORDER BY a.score DESC, a.activityWeek DESC
            """,
            countQuery = "SELECT COUNT(DISTINCT a.user) FROM Arena a")
    Page<Arena> getHighestScoresPerUser(@Param("activityWeek") String activityWeek, Pageable pageable);
}
