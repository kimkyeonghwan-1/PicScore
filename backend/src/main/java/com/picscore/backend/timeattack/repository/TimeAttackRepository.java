package com.picscore.backend.timeattack.repository;

import com.picscore.backend.timeattack.model.entity.TimeAttack;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface TimeAttackRepository extends JpaRepository<TimeAttack, Long> {

    List<TimeAttack> findByUserId(Long userId);

    @Query("SELECT " +
            "AVG(t.score) as avgScore " +
            "FROM TimeAttack t " +
            "WHERE t.user.id = :userId")
    Map<String, Object> calculateStats(@Param("userId") Long userId);

    @Query(value = """
            SELECT t FROM TimeAttack t
            WHERE t.score = (
                SELECT MAX(t2.score) FROM TimeAttack t2 WHERE t2.user = t.user
            )
            AND t.createdAt = (
                SELECT MAX(t3.createdAt) FROM TimeAttack t3 WHERE t3.user = t.user AND t3.score = t.score
            )
            ORDER BY t.score DESC, t.createdAt DESC
        """,
            countQuery = "SELECT COUNT(DISTINCT t.user) FROM TimeAttack t")
    Page<TimeAttack> findHighestScoresPerUser(Pageable pageable);

    @Query(value = """
        SELECT t FROM TimeAttack t
        WHERE t.score = (
            SELECT MAX(t2.score) FROM TimeAttack t2 WHERE t2.user = t.user
        )
        AND t.createdAt = (
            SELECT MAX(t3.createdAt) FROM TimeAttack t3 WHERE t3.user = t.user AND t3.score = t.score
        )
        ORDER BY t.score DESC, t.createdAt DESC
    """)
    List<TimeAttack> findHighestScoresAllUser();



}
