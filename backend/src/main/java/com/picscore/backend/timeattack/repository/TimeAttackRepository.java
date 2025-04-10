package com.picscore.backend.timeattack.repository;

import com.picscore.backend.timeattack.model.entity.TimeAttack;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

/**
 * 타임어택(TimeAttack) 관련 DB 작업을 처리하는 Repository
 */
public interface TimeAttackRepository extends JpaRepository<TimeAttack, Long> {


    /**
     * 주차(activityWeek)별로 유저별 최고 점수 중 가장 최신 기록을 기준으로 전체 랭킹을 조회합니다.
     *
     * @param activityWeek 활동 주차
     * @return 유저별 최고 점수 기록 목록
     */
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


    /**
     * 특정 유저의 타임어택 기록 개수를 반환합니다.
     *
     * @param userId 유저 ID
     * @return 기록 개수
     */
    int countByUserId(Long userId);


    /**
     * 특정 유저가 특정 등수를 가진 기록이 존재하는지 확인합니다.
     *
     * @param userId 유저 ID
     * @param ranking 등수
     * @return 존재 여부
     */
    Boolean existsByUserIdAndRanking(Long userId, int ranking);


    /**
     * 특정 유저가 특정 점수 이상의 기록을 남긴 적이 있는지 확인합니다.
     *
     * @param userId 유저 ID
     * @param score 기준 점수
     * @return 존재 여부
     */
    Boolean existsByUserIdAndScoreGreaterThanEqual(Long userId, float score);


    /**
     * 특정 유저들 중 주차별 최고 점수 및 가장 최신 기록을 조회합니다.
     *
     * @param userIds 유저 ID 리스트
     * @param week 활동 주차
     * @return 최고 기록 목록
     */
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

