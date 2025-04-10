package com.picscore.backend.badge.service;

import com.picscore.backend.badge.model.request.TimeAttackScoreRequest;
import com.picscore.backend.badge.model.response.*;

import java.util.List;

/**
 * 업적(Badge) 관련 기능을 정의한 인터페이스입니다.
 * 구현체는 BadgeServiceImpl 입니다.
 */
public interface BadgeService {


    /**
     * 사용자의 배지 정보를 조회하는 메서드
     */
    List<GetBadgeResponse> getBadge(Long userId);


    /**
     * 특정 사용자가 한 명 이상의 팔로워를 가지면 뱃지를 부여하는 메서드
     */
    String followOne(Long userId);


    /**
     * 사용자가 30명 이상의 팔로워를 달성하면 뱃지를 부여하는 메서드
     */
    String followTwo(Long userId);


    /**
     * 사용자가 첫 번째 게시글을 작성하면 뱃지를 부여하는 메서드
     */
    String postOne(Long userId);


    /**
     * 사용자가 게시글을 10개 이상 작성하면 뱃지를 부여하는 메서드
     */
    String postTwo(Long userId);


    /**
     * 사용자가 타임어택을 20회 이상 참여하면 뱃지를 부여하는 메서드
     */
    String timeAttackOne(Long userId);


    /**
     * 사용자가 타임어택에서 1위를 달성하면 뱃지를 부여하는 메서드
     */
    String timeAttackRank(Long userId);


    /**
     * 사용자가 타임어택에서 90점 이상을 기록하면 뱃지를 부여하는 메서드
     */
    String timeAttackScore(Long userId);


    /**
     * 사용자가 사진 평가에서 90점 이상을 기록하면 뱃지를 부여하는 메서드
     */
    String photoScore(Long userId);


    /**
     * 사용자가 올린 사진 중 좋아요 10개 이상 받은 사진이 있을 경우 뱃지를 부여하는 메서드
     */
    String photoLike(Long userId);


    /**
     * 사용자가 모든 업적(뱃지)을 획득했는지 확인하고, 달성 시 최종 뱃지를 부여하는 메서드
     */
    String obtainAll(Long userId);


    /**
     * 타임 어택 점수를 기반으로 사용자에게 뱃지 부여를 처리하는 메서드
     */
    String getTimeAttackScore(Long userId, TimeAttackScoreRequest request);
}
