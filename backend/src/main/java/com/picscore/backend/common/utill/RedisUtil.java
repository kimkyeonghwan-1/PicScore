package com.picscore.backend.common.utill;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RedisUtil {

    private final RedisTemplate<String, Object> redisTemplate;


    /**
     * 키-값 쌍을 저장하고 만료 시간을 설정합니다. (SETEX 기능)
     *
     * @param key     저장할 키
     * @param value   저장할 값
     * @param seconds 만료 시간(초)
     */
    public void setex(
            String key, Object value, long seconds) {

        redisTemplate.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
    }


    /**
     * 키의 남은 만료 시간을 조회합니다.
     *
     * @param key 조회할 키
     * @return 남은 만료 시간(초), 키가 없거나 만료 시간이 설정되지 않은 경우 null
     */
    public Long getTtl(
            String key) {

        return redisTemplate.getExpire(key);
    }


    /**
     * 키에 해당하는 값을 조회합니다.
     *
     * @param key 조회할 키
     * @return 저장된 값, 키가 없는 경우 null
     */
    public Object get(
            String key) {

        return redisTemplate.opsForValue().get(key);
    }


    /**
     * 키의 존재 여부를 확인합니다.
     *
     * @param key 확인할 키
     * @return 키가 존재하면 true, 그렇지 않으면 false
     */
    public Boolean exists(
            String key) {

        return redisTemplate.hasKey(key);
    }


    /**
     * 지정된 키를 삭제합니다.
     *
     * @param key 삭제할 키
     * @return 키가 성공적으로 삭제되면 true, 키가 존재하지 않으면 false
     */
    public Boolean delete(
            String key) {

        return redisTemplate.delete(key);
    }


    /**
     * ZSet에 사용자 점수를 추가하거나 갱신합니다.
     * 점수가 기존보다 높을 때만 갱신하며, 점수는 '점수 * 1e13 + timestamp' 형태로 저장되어
     * 동점일 경우 더 최신 기록이 우선 정렬됩니다.
     * TTL은 키가 처음 생성된 경우에만 설정됩니다.
     *
     * @param key      ZSet의 Redis 키
     * @param userId   사용자 식별자
     * @param newScore 새로 저장할 점수
     * @param days     TTL(유효기간) 일 수
     */
    public void addScoreToZSetWithTTL(
            String key, String userId, double newScore, long days) {

        // 현재 저장된 score 가져오기
        Double currentRawScore = redisTemplate.opsForZSet().score(key, userId);
        double currentScore = currentRawScore != null ? currentRawScore : -1;

        long now = System.currentTimeMillis();
        double finalScore = newScore * 1e13 + now;

        // 기존 점수보다 클 때만 갱신
        if (finalScore > currentScore) {

            redisTemplate.opsForZSet().add(key, userId, finalScore);

            // key가 처음 생긴 경우에만 TTL 설정
            if (Boolean.FALSE.equals(redisTemplate.hasKey(key))) {
                redisTemplate.expire(key, days, TimeUnit.DAYS);
            }
        }
    }


    /**
     * ZSet에서 점수가 높은 순으로 유저 ID 리스트를 반환합니다.
     * 순위는 start ~ end 범위로 지정할 수 있으며, score가 높은 순으로 정렬됩니다.
     *
     * @param key   ZSet의 Redis 키
     * @param start 시작 인덱스 (0부터 시작)
     * @param end   종료 인덱스
     * @return 사용자 ID 리스트 (점수 내림차순 정렬)
     */
    public List<String> getTopRankersInOrder(
            String key, int start, int end) {

        Set<ZSetOperations.TypedTuple<Object>> tuples = redisTemplate.opsForZSet()
                .reverseRangeWithScores(key, start, end);

        return tuples.stream()
                .map(t -> t.getValue().toString())
                .collect(Collectors.toList()); // List로 변환 → 순서 보장
    }


    /**
     * 특정 사용자 ID의 현재 랭킹을 반환합니다.
     * 점수가 높은 순서대로 랭크되며, 0부터 시작합니다.
     *
     * @param key     ZSet의 Redis 키
     * @param userId  사용자 ID
     * @return 사용자의 랭킹 (0: 1위), 없으면 null
     */
    public Long getUserRank(
            String key, String userId) {

        return redisTemplate.opsForZSet().reverseRank(key, userId);
    }


    /**
     * ZSet의 크기(저장된 사용자 수)를 반환합니다.
     *
     * @param key ZSet의 Redis 키
     * @return ZSet의 전체 크기
     */
    public Long getZSetSize(
            String key) {

        return redisTemplate.opsForZSet().size(key);
    }
}

