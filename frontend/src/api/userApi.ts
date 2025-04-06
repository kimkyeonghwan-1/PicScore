import { testApi } from "./api";

// 공통 API 응답 타입 정의
interface BaseResponse<T> {
  data: T;
  message: string;
  status: number;
  statusText: string;
  timeStamp: string;
}

// User profile data interfaces
interface UserProfile {
  userId: number;
  nickName: string;
  profileImage: string;
  message: string;
  level: number;
  experience: number;
  followerCnt: number;
  followingCnt: number;
  badgeList: ProfileBadge[];
}

interface UserProfileWithFollowing extends UserProfile {
  isFollowing: boolean;
}

interface ProfileBadge {
  badgeId: number;
  badgeName: string;
  badgeImage: string;
}

// Follower/Following interfaces
interface FollowerResponse {
  userId: number;
  profileImage: string;
  nickName: string;
  isFollowing: boolean;
}

interface FollowingResponse {
  userId: number;
  profileImage: string;
  nickName: string;
}

interface UserStatistics {
  scoreAvg: number;
  timeAttackRank: number;
  arenaRank: number;
}

interface SearchUserResponse {
  userId: number;
  profileImage: string;
  nickName: string;
  message: string;
}

interface UpdateProfileRequest {
  profileImage: string;
  nickName: string;
  message: string;
}

export const userApi = {
  // User profile endpoints
  getMyProfile: () => {
    return testApi.get<BaseResponse<UserProfile>>("/api/v1/user/profile/me");
  },

  getUserProfile: (userId: number) => {
    return testApi.get<BaseResponse<UserProfileWithFollowing>>(
      `/api/v1/user/profile/${userId}`
    );
  },

  updateProfile: (formData: FormData) => {
    return testApi.patch<BaseResponse<void>>("/api/v1/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Follower/Following endpoints
  getMyFollowers: () => {
    return testApi.get<BaseResponse<FollowerResponse[]>>(
      "/api/v1/user/follower/me"
    );
  },

  getMyFollowings: () => {
    return testApi.get<BaseResponse<FollowingResponse[]>>(
      "/api/v1/user/following/me"
    );
  },

  getUserFollowers: (userId: number) => {
    return testApi.get<BaseResponse<FollowerResponse[]>>(
      `/api/v1/user/follower/${userId}`
    );
  },

  getUserFollowings: (userId: number) => {
    return testApi.get<BaseResponse<FollowerResponse[]>>(
      `/api/v1/user/following/${userId}`
    );
  },

  toggleFollow: (followingId: number) => {
    return testApi.post<BaseResponse<void>>("/api/v1/user/following/me", {
      followingId,
    });
  },

  deleteFollower: (userId: number) => {
    return testApi.delete<BaseResponse<void>>(
      `/api/v1/user/follower/${userId}`
    );
  },

  // Search functionality
  searchUser: (searchText: string) => {
    return testApi.get<BaseResponse<SearchUserResponse[]>>(
      `/api/v1/user/search/${searchText}`
    );
  },

  // Statistics endpoints
  getMyStatistics: () => {
    return testApi.get<BaseResponse<UserStatistics>>("/api/v1/user/static/me");
  },

  getUserStatistics: (userId: number) => {
    return testApi.get<BaseResponse<UserStatistics>>(
      `/api/v1/user/static/${userId}`
    );
  },

  // User photos endpoints
  getMyPhotos: (isPublic: boolean) => {
    return testApi.get<BaseResponse<any>>("/api/v1/user/photo/me", {
      params: { isPublic },
    });
  },

  getUserPhotos: (userId: number, isPublic: boolean) => {
    return testApi.get<BaseResponse<any>>(`/api/v1/user/photo/${userId}`, {
      params: { isPublic },
    });
  },

  // User authentication endpoints
  logout: async () => {
    try {
      const response = await testApi.post("/api/v1/user/logout");
      return response.data;
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  },

  deleteAccount: () => {
    return testApi.delete<BaseResponse<void>>("/api/v1/user");
  },
};
