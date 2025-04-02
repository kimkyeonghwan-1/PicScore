// api/badgeApi.ts
import { testApi } from "./api";
import { useAuthStore } from "../store/authStore";

// Badge API response type definitions
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// Badge information interface
interface BadgeResponseData {
  badgeId: number;
  name: string;
  image: string;
  obtainCondition: string;
  isObtain: boolean;
}

// Profile badge interface as returned by API
interface ProfileBadgeResponse {
  badgeId: number;
  badgeName: string;
  badgeImage: string;
}

export const badgeApi = {
  // Get all badges with their achievement status
  getAllBadges: () => {
    return testApi.get<BaseResponse<BadgeResponseData[]>>(" /api/v1/badge", {});
  },

  // Get badges for user profile display
  getUserBadges: (userId: number) => {
    return testApi.get<BaseResponse<ProfileBadgeResponse[]>>(
      `/api/v1/badge/user/${userId}`
    );
  },

  // Set the badge to display on user profile
  setDisplayBadge: (badgeId: number) => {
    return testApi.patch<BaseResponse<void>>("/api/v1/user/profile/badge", {
      badgeId,
    });
  },

  // For admin or testing - manually complete a badge
  completeBadge: (badgeId: number) => {
    return testApi.post<BaseResponse<void>>("/api/v1/badge/complete", {
      badgeId,
    });
  },

  // Get current display badge for user
  getCurrentDisplayBadge: () => {
    return testApi.get<BaseResponse<ProfileBadgeResponse>>(
      "/api/v1/user/profile/badge"
    );
  },
};
