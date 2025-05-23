package com.picscore.backend.arena.service;

import java.util.Map;

/**
 * 아레나(Arena) 관련 기능을 정의한 인터페이스입니다.
 * 구현체는 ArenaServiceImpl 입니다.
 */
public interface ArenaService {


    /**
     * 랜덤한 사진 4장을 가져오는 메서드
     */
    Map<String, Object> randomPhotos();


    /**
     * Arena 점수를 계산하고 사용자 경험치를 업데이트하는 메서드
     */
    Integer calculateArena(Long userId, int correct, String time);


    /**
     * Arena 랭킹 정보를 페이지별로 조회하는 메서드
     */
    Map<String, Object> getArenaRanking(int pageNum);
}
