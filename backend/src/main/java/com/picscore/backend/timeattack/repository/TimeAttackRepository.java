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

    @Query("SELECT " +
            "AVG(t.score) as avgScore " +
            "FROM TimeAttack t " +
            "WHERE t.user.id = :userId")
    Map<String, Object> calculateStats(@Param("userId") Long userId);

    @Query(value = """
            SELECT t FROM TimeAttack t
            WHERE t.score = (
                SELECT MAX(t2.score) FROM TimeAttack t2 WHERE t2.user = t.user AND t2.activityWeek = :activityWeek
            )
            AND t.createdAt = (
                SELECT MAX(t3.createdAt) FROM TimeAttack t3 WHERE t3.user = t.user AND t3.score = t.score AND t3.activityWeek = :activityWeek
            )
            AND t.activityWeek = :activityWeek
            ORDER BY t.score DESC, t.createdAt DESC
        """,
            countQuery = "SELECT COUNT(DISTINCT t.user) FROM TimeAttack t WHERE t.activityWeek = :activityWeek")
    Page<TimeAttack> findHighestScoresPerUser(@Param("activityWeek") String activityWeek, Pageable pageable);

    @Query(value = """
        SELECT t FROM TimeAttack t
        WHERE t.score = (
            SELECT MAX(t2.score) FROM TimeAttack t2 WHERE t2.user = t.user AND t2.activityWeek = :activityWeek
        )
        AND t.createdAt = (
            SELECT MAX(t3.createdAt) FROM TimeAttack t3 WHERE t3.user = t.user AND t3.score = t.score AND t3.activityWeek = :activityWeek
        )
        AND t.activityWeek = :activityWeek
        ORDER BY t.score DESC, t.createdAt DESC
    """)
    List<TimeAttack> findHighestScoresAllUser(@Param("activityWeek") String activityWeek);

    int countByUserId(Long userId);

    Boolean existsByUserIdAndRanking(Long userId, int ranking);

    Boolean existsByUserIdAndScoreGreaterThanEqual(Long userId, float score);

    @Query("""
    SELECT t FROM TimeAttack t
    WHERE t.user.id IN :userIds
    AND t.activityWeek = :week
    AND t.score = (
        SELECT MAX(t2.score) FROM TimeAttack t2
        WHERE t2.user = t.user AND t2.activityWeek = :week
    )
    AND t.createdAt = (
        SELECT MAX(t3.createdAt) FROM TimeAttack t3
        WHERE t3.user = t.user AND t3.activityWeek = :week AND t3.score = t.score
    )
    """)
    List<TimeAttack> findBestRecordByUsers(@Param("userIds") List<Long> userIds,
                                           @Param("week") String week);
}
