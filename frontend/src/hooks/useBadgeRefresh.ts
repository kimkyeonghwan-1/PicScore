// hooks/useBadgeRefresh.ts
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { badgeApi } from "../api/badgeApi";
import { useAuthStore } from "../store/authStore";

/**
 * 배지 데이터를 리프레시하는 훅
 * 컴포넌트 마운트 시 배지 데이터를 다시 불러옴
 */
export const useBadgeRefresh = (refreshOnMount: boolean = true) => {
  const queryClient = useQueryClient();

  // 배지 데이터 리프레시 함수
  const refreshBadges = async () => {
    try {
      console.log("배지 데이터 리프레시 시작...");

      // 배지 데이터 가져오기
      const response = await badgeApi.getAllBadges();

      // 쿼리 캐시 업데이트
      queryClient.setQueryData(["badges"], response);

      console.log("배지 데이터 리프레시 완료:", response.data);

      return response;
    } catch (error) {
      console.error("배지 데이터 리프레시 실패:", error);
      throw error;
    }
  };

  // 컴포넌트 마운트 시 리프레시
  useEffect(() => {
    if (refreshOnMount) {
      refreshBadges();
    }
  }, [refreshOnMount]);

  return { refreshBadges };
};
