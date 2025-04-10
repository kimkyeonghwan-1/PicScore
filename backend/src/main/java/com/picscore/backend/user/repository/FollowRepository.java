package com.picscore.backend.user.repository;

import com.picscore.backend.user.model.entity.Follow;
import com.picscore.backend.user.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 팔로우(Follow) 관련 DB 접근을 담당하는 레포지토리
 */
public interface FollowRepository extends JpaRepository<Follow, Long> {


    /**
     * 팔로워 ID와 팔로잉 ID를 기준으로 특정 팔로우 관계를 조회합니다.
     *
     * @param followerId 팔로우 요청을 한 사용자 ID
     * @param followingId 팔로우 대상 사용자 ID
     * @return 해당 팔로우 관계가 존재하면 Optional로 반환, 없으면 Optional.empty()
     */
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);


    /**
     * 특정 사용자를 팔로우하고 있는 모든 팔로우 엔티티를 조회합니다.
     *
     * @param followingId 팔로우 대상 사용자 ID
     * @return 해당 사용자를 팔로우하는 Follow 리스트
     */
    List<Follow> findByFollowingId(Long followingId);


    /**
     * 특정 사용자가 팔로우하고 있는 모든 팔로우 엔티티를 조회합니다.
     *
     * @param followerId 팔로우 요청을 한 사용자 ID
     * @return 해당 사용자가 팔로우하는 Follow 리스트
     */
    List<Follow> findByFollowerId(Long followerId);


    /**
     * 특정 팔로우 관계가 존재하는지 여부를 확인합니다.
     *
     * @param followerId 팔로우 요청을 한 사용자 ID
     * @param followingId 팔로우 대상 사용자 ID
     * @return 팔로우 관계가 존재하면 true, 아니면 false
     */
    Boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);


    /**
     * 특정 사용자를 팔로우하는 사람의 수(팔로워 수)를 조회합니다.
     *
     * @param followingId 팔로우 대상 사용자 ID
     * @return 팔로워 수
     */
    int countByFollowingId(Long followingId);


    /**
     * 특정 사용자가 팔로우하고 있는 사람의 수(팔로잉 수)를 조회합니다.
     *
     * @param followerId 팔로우 요청을 한 사용자 ID
     * @return 팔로잉 수
     */
    int countByFollowerId(Long followerId);
}

