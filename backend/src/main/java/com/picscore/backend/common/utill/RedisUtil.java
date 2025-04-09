package com.picscore.backend.common.utill;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
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
    public void setex(String key, Object value, long seconds) {
        redisTemplate.opsForValue().set(key, value, seconds, TimeUnit.SECONDS);
    }


    /**
     * 키의 남은 만료 시간을 조회합니다.
     *
     * @param key 조회할 키
     * @return 남은 만료 시간(초), 키가 없거나 만료 시간이 설정되지 않은 경우 null
     */
    public Long getTtl(String key) {
        return redisTemplate.getExpire(key);
    }


    /**
     * 키에 해당하는 값을 조회합니다.
     *
     * @param key 조회할 키
     * @return 저장된 값, 키가 없는 경우 null
     */
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }


    /**
     * 키의 존재 여부를 확인합니다.
     *
     * @param key 확인할 키
     * @return 키가 존재하면 true, 그렇지 않으면 false
     */
    public Boolean exists(String key) {
        return redisTemplate.hasKey(key);
    }


    /**
     * 지정된 키를 삭제합니다.
     *
     * @param key 삭제할 키
     * @return 키가 성공적으로 삭제되면 true, 키가 존재하지 않으면 false
     */
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }

    public void addScoreToZSetWithTTL(String key, String userId, double newScore, long days) {
        // 현재 저장된 score 가져오기
        Double currentRawScore = redisTemplate.opsForZSet().score(key, userId);

        double currentScore = currentRawScore != null ? extractOriginalScore(currentRawScore) : -1;

        // 기존 점수보다 클 때만 갱신
        if (newScore > currentScore) {
            long now = System.currentTimeMillis();
//            double finalScore = newScore * 1e13 + now;
            double finalScore = -(newScore * 1e13 + now); // ✅ 음수로 저장!
            redisTemplate.opsForZSet().add(key, userId, finalScore);

            // key가 처음 생긴 경우에만 TTL 설정
            if (Boolean.FALSE.equals(redisTemplate.hasKey(key))) {
                redisTemplate.expire(key, days, TimeUnit.DAYS);
            }
        }
    }

    public Set<String> getTopRankers(String key, int start, int end) {
//        Set<Object> rawSet = redisTemplate.opsForZSet().reverseRange(key, start, end);
        Set<Object> rawSet = redisTemplate.opsForZSet().range(key, start, end); // ✅ reverseRange → range
        return rawSet.stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    public Long getUserRank(String key, String userId) {
        return redisTemplate.opsForZSet().reverseRank(key, userId);
    }

    public Long getZSetSize(String key) {
        return redisTemplate.opsForZSet().size(key);
    }

    // 점수 추출 (score = 점수 * 1e13 + timestamp 이기 때문에 원래 점수만 추출)
    private double extractOriginalScore(double rawScore) {
//        return Math.floor(rawScore / 1e13);
        return Math.floor(-rawScore / 1e13); // ✅ 음수 기준 반대로
    }
}

