package com.picscore.backend.user.service;

import com.picscore.backend.common.model.response.BaseResponse;
import com.picscore.backend.user.model.response.GetMyFollowingsResponse;
import com.picscore.backend.user.model.response.GetUserFollowersResponse;
import com.picscore.backend.user.model.response.GetUserFollowingsResponse;
import com.picscore.backend.user.model.entity.Follow;
import com.picscore.backend.user.model.entity.User;
import com.picscore.backend.user.model.response.GetMyFollowersResponse;
import com.picscore.backend.user.repository.FollowRepository;
import com.picscore.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;


    /**
     * 팔로우 관계를 토글(추가/삭제)하는 메서드
     *
     * @param followerId 팔로우를 하는 사용자의 ID
     * @param followingId 팔로우 대상 사용자의 ID
     * @return Boolean 팔로우 관계가 생성되면 true, 삭제되면 false
     */
    @Transactional
    public Boolean toggleFollow(Long followerId, Long followingId) {
        // 팔로워와 팔로잉 사용자 조회
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + followerId));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID; " + followingId));

        // 기존 팔로우 관계 확인
        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);

        if (existingFollow.isPresent()) {
            // 기존 팔로우 관계가 있으면 삭제
            followRepository.delete(existingFollow.get());
            return false;
        } else {
            // 팔로우 관계가 없으면 새로 생성
            Follow follow = new Follow(
                    follower,
                    following
            );
            followRepository.save(follow);
            return true;
        }
    }


    /**
     * 현재 사용자의 팔로워 목록을 조회하는 메서드
     *
     * @param userId 현재 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetMyFollowersResponse>> 팔로워 목록을 포함한 응답
     */
    public ResponseEntity<BaseResponse<List<GetMyFollowersResponse>>> getMyFollowers(Long userId) {
        // 현재 사용자가 팔로잉되어 있는 모든 팔로우 Entity 조회
        List<Follow> followList = followRepository.findByFollowingId(userId);

        // 팔로워 정보를 DTO로 변환
        List<GetMyFollowersResponse> followers =
                followList.stream()
                        .map(follow -> {
                            User follower = follow.getFollower();
                            // 현재 사용자가 해당 팔로워를 팔로우하고 있는지 확인
                            boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(
                                    userId, follower.getId()
                            );

                            // 팔로워 정보를 DTO로 변환
                            return new GetMyFollowersResponse(
                                    follower.getId(),
                                    follower.getProfileImage(),
                                    follower.getNickName(),
                                    isFollowing
                            );
                        })
                        .collect(Collectors.toList());

        // 성공 응답 반환
        return ResponseEntity.ok(BaseResponse.success("팔로워 조회 성공", followers));
    }


    /**
     * 현재 사용자의 팔로잉 목록을 조회하는 메서드
     *
     * @param userId 현재 사용자의 ID
     * @return ResponseEntity<BaseResponse<GetMyFollowersResponse>> 팔로잉 목록을 포함한 응답
     */
    public ResponseEntity<BaseResponse<List<GetMyFollowingsResponse>>> getMyFollowings(Long userId) {

        // 현재 사용자가 팔로워되어 있는 모든 팔로우 Entity 조회
        List<Follow> followList = followRepository.findByFollowerId(userId);

        // 팔로잉 정보를 DTO로 변환
        List<GetMyFollowingsResponse> followings =
                followList.stream()
                        .map(follow -> {
                            User following = follow.getFollowing();

                            // 팔로잉 정보를 DTO로 변환
                            return new GetMyFollowingsResponse(
                                    following.getId(),
                                    following.getProfileImage(),
                                    following.getNickName()
                            );
                        })
                        .collect(Collectors.toList());;

        // 성공 응답 반환
        return ResponseEntity.ok(BaseResponse.success("팔로잉 조회 성공", followings));
    }

    /**
     * 특정 사용자의 팔로워 목록을 조회하는 메서드
     *
     * @param myId 현재 로그인한 사용자의 ID
     * @param userId 팔로워를 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<List<GetUserFollowersResponse>>> 팔로워 목록을 포함한 응답
     */
    public ResponseEntity<BaseResponse<List<GetUserFollowersResponse>>> getUserFollowers(Long myId, Long userId) {
        // 해당 사용자의 팔로워 목록 조회
        List<Follow> followList = followRepository.findByFollowingId(userId);

        // 팔로워 정보를 DTO로 변환
        List<GetUserFollowersResponse> followers =
                followList.stream()
                        .map(follow -> {
                            User follower = follow.getFollower();
                            // 현재 로그인한 사용자가 이 팔로워를 팔로우하고 있는지 확인
                            boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(
                                    myId, follower.getId()
                            );
                            // DTO 생성 및 반환
                            return new GetUserFollowersResponse(
                                    follower.getId(),
                                    follower.getProfileImage(),
                                    follower.getNickName(),
                                    isFollowing
                            );
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(BaseResponse.success("팔로워 조회 성공", followers));
    }

    /**
     * 특정 사용자의 팔로잉 목록을 조회하는 메서드
     *
     * @param myId 현재 로그인한 사용자의 ID
     * @param userId 팔로잉을 조회할 사용자의 ID
     * @return ResponseEntity<BaseResponse<List<GetUserFollowingsResponse>>> 팔로잉 목록을 포함한 응답
     */
    public ResponseEntity<BaseResponse<List<GetUserFollowingsResponse>>> getUserFollowings(Long myId, Long userId) {
        // 해당 사용자의 팔로잉 목록 조회
        List<Follow> followList = followRepository.findByFollowerId(userId);

        // 팔로잉 정보를 DTO로 변환
        List<GetUserFollowingsResponse> followings =
                followList.stream()
                        .map(follow -> {
                            User following = follow.getFollowing();
                            // 현재 로그인한 사용자가 이 팔로잉을 팔로우하고 있는지 확인
                            boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(
                                    myId, following.getId()
                            );
                            // DTO 생성 및 반환
                            return new GetUserFollowingsResponse(
                                    following.getId(),
                                    following.getProfileImage(),
                                    following.getNickName(),
                                    isFollowing
                            );
                        })
                        .collect(Collectors.toList());

        return ResponseEntity.ok(BaseResponse.success("팔로잉 조회 성공", followings));
    }

    /**
     * 현재 사용자의 팔로워를 삭제하는 메서드
     *
     * @param myId 현재 로그인한 사용자의 ID
     * @param userId 삭제할 팔로워의 ID
     * @return ResponseEntity<BaseResponse<Void>> 삭제 결과를 포함한 응답
     */
    public ResponseEntity<BaseResponse<Void>> deleteMyFollower(Long myId, Long userId) {
        // 팔로워 관계 조회
        Optional<Follow> follow = followRepository.findByFollowerIdAndFollowingId(userId, myId);

        // 팔로워 관계가 존재하면 삭제
        if (follow.isPresent()) {
            followRepository.delete(follow.get());
        }

        return ResponseEntity.ok(BaseResponse.withMessage("팔로워 삭제 완료"));
    }

}

