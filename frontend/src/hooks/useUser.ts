import { testApi } from "../api/api";
import { useAuthStore } from "../store/authStore";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

// Profile hooks
export const useMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const response = await userApi.getMyProfile();
      return response.data;
    },
  });
};

export const useUserProfile = (userId: number) => {
  console.log("userId", userId);
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await userApi.getUserProfile(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      // Invalidate and refetch the myProfile query after successful update
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error) => {
      console.log("프로필 업데이트 실패", error);
    },
  });
};

// Follower hooks
export const useMyFollowers = () => {
  return useQuery({
    queryKey: ["myFollowers"],
    queryFn: async () => {
      const response = await userApi.getMyFollowers();
      return response.data;
    },
  });
};

export const useMyFollowings = () => {
  return useQuery({
    queryKey: ["myFollowings"],
    queryFn: async () => {
      const response = await userApi.getMyFollowings();
      return response.data;
    },
  });
};

export const useUserFollowers = (userId: number) => {
  return useQuery({
    queryKey: ["userFollowers", userId],
    queryFn: async () => {
      const response = await userApi.getUserFollowers(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserFollowings = (userId: number) => {
  return useQuery({
    queryKey: ["userFollowings", userId],
    queryFn: async () => {
      const response = await userApi.getUserFollowings(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.toggleFollow,
    onSuccess: () => {
      // Invalidate relevant queries after toggling follow status
      queryClient.invalidateQueries({ queryKey: ["myFollowings"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useDeleteFollower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteFollower,
    onSuccess: () => {
      // Invalidate the myFollowers query after successful deletion
      queryClient.invalidateQueries({ queryKey: ["myFollowers"] });
    },
  });
};

// Search hook
export const useSearchUsers = (searchText: string) => {
  return useQuery({
    queryKey: ["searchUsers", searchText],
    queryFn: async () => {
      const response = await userApi.searchUser(searchText);
      return response.data;
    },
    enabled: searchText.length > 0,
  });
};

// Statistics hooks
export const useMyStatistics = () => {
  return useQuery({
    queryKey: ["myStatistics"],
    queryFn: async () => {
      const response = await userApi.getMyStatistics();
      return response.data;
    },
  });
};

export const useUserStatistics = (userId: number) => {
  return useQuery({
    queryKey: ["userStatistics", userId],
    queryFn: async () => {
      const response = await userApi.getUserStatistics(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

// Photo hooks
export const useMyPhotos = (isPublic: boolean) => {
  return useQuery({
    queryKey: ["myPhotos", isPublic],
    queryFn: async () => {
      const response = await userApi.getMyPhotos(isPublic);
      return response.data;
    },
  });
};

export const useUserPhotos = (userId: number) => {
  return useQuery({
    queryKey: ["userPhotos", userId],
    queryFn: async () => {
      const response = await userApi.getUserPhotos(userId, true); // or false, depending on your requirement
      return response.data;
    },
    enabled: !!userId,
  });
};

// Auth hooks
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      // Clear all queries from cache on account deletion
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await testApi.post(
        `${baseURL}/api/v1/user/logout`,
        {} // 빈 객체 또는 필요한 데이터
      );
      return response;
    },
    onSuccess: (data) => {
      console.log("로그아웃 완료:", data);
    },
    onError: (error) => {
      console.log("로그아웃 실패", error);
    },
  });
};

// 쿠키 사용한 로직
// export const useLogout = () => {
//   return useMutation({
//     mutationFn: async () => {
//       const response = await api.post("api/v1/user/logout");
//       return response;
//     },
//     onSuccess: (data) => {
//       console.log("로그아웃 완료:", data);
//     },
//     onError: (error) => {
//       console.log("로그아웃 실패", error);
//     },
//   });
// };
