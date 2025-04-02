// api/followApi.ts
import { testApi } from "./api";

// 응답 인터페이스
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// 팔로우 사용자 정보 인터페이스
export interface FollowerUser {
  userId: number;
  profileImage: string;
  nickName: string;
  isFollowing: boolean;
}

// 팔로잉 사용자 정보 인터페이스
export interface FollowingUser {
  userId: number;
  profileImage: string;
  nickName: string;
}

// 팔로우 토글 요청 인터페이스
interface ToggleFollowRequest {
  followingId: number;
}

export const followApi = {
  // 내 팔로워 목록 조회
  getMyFollowers: () => {
    return testApi.get<BaseResponse<FollowerUser[]>>(
      "/api/v1/user/follower/me"
    );
  },

  // 내 팔로잉 목록 조회
  getMyFollowings: () => {
    return testApi.get<BaseResponse<FollowingUser[]>>(
      "/api/v1/user/following/me"
    );
  },

  // 특정 사용자의 팔로워 목록 조회
  getUserFollowers: (userId: number) => {
    return testApi.get<BaseResponse<FollowerUser[]>>(
      `/api/v1/user/follower/${userId}`
    );
  },

  // 특정 사용자의 팔로잉 목록 조회
  getUserFollowings: (userId: number) => {
    return testApi.get<BaseResponse<FollowerUser[]>>(
      `/api/v1/user/following/${userId}`
    );
  },

  // 팔로우/언팔로우 토글
  toggleFollow: (followingId: number) => {
    const data: ToggleFollowRequest = { followingId };
    return testApi.post<BaseResponse<void>>("/api/v1/user/following/me", data);
  },

  // 팔로워 삭제 (차단)
  deleteFollower: (userId: number) => {
    return testApi.delete<BaseResponse<void>>(
      `/api/v1/user/follower/${userId}`
    );
  },
};
