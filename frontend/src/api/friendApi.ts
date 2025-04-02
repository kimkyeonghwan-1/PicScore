import { testApi } from "./api";
import { useAuthStore } from "../store/authStore";

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
  isFollowing: boolean; // 이 필드가 있는지 확인 필요
}

// 사용자 프로필 정보 인터페이스
export interface UserProfile {
  userId: number;
  nickName: string;
  profileImage: string;
  message: string;
  level: number;
  experience: number;
  followerCnt: number;
  followingCnt: number;
  isFollowing: boolean;
  badgeList: ProfileBadge[];
}

// 배지 정보 인터페이스
interface ProfileBadge {
  badgeId: number;
  badgeName: string;
  badgeImage: string;
}

export const friendApi = {
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
    return testApi.get<BaseResponse<FollowingUser[]>>(
      `/api/v1/user/following/${userId}`
    );
  },

  // 특정 사용자의 프로필 정보 조회
  getUserProfile: (userId: number) => {
    return testApi.get<BaseResponse<UserProfile>>(
      `/api/v1/user/profile/${userId}`
    );
  },

  // 팔로우/언팔로우 토글
  toggleFollow: (followingId: number) => {
    return testApi.post<BaseResponse<void>>("/api/v1/user/following/me", {
      followingId,
    });
  },

  // 팔로워 삭제 (차단)
  deleteFollower: (userId: number) => {
    return testApi.delete<BaseResponse<void>>(
      `/api/v1/user/follower/${userId}`
    );
  },

  searchFriends: (searchText: string) => {
    return testApi.get(`/api/v1/user/search/${searchText}`);
  },
};
