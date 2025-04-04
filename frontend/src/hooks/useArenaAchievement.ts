import { useCallback } from "react";
import { achievementApi } from "../api/achievementApi";

export const useArenaAchievement = () => {
  const checkArenaAchievement = useCallback(async (correctCount: number) => {
    try {
      // 실제로는 백엔드에 구현된 Arena 업적 API를 호출해야 합니다.
      // 여기서는 단순히 콘솔에 기록만 남깁니다.
      console.log(`아레나 정답 ${correctCount}개 달성 체크`);
      return true;
    } catch (error) {
      console.error("아레나 업적 체크 오류:", error);
      return false;
    }
  }, []);

  return { checkArenaAchievement };
};
