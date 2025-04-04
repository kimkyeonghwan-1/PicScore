// api/achievementApi.ts
import { testApi } from "./api";
import { useAuthStore } from "../store/authStore";

// 기본 응답 인터페이스
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// 업적 달성 체크 및 완료 API
export const achievementApi = {
  // 특정 업적 완료 처리
  completeBadge: (badgeId: number) => {
    return testApi.post("/api/v1/badge/complete", { badgeId });
  },

  // 업적 달성 조건 확인 및 자동 달성 처리
  checkAchievements: async () => {
    try {
      // 사용자 정보 가져오기
      const userResponse = await testApi.get("/api/v1/user/profile/me", {});

      const userData = userResponse.data.data;

      // 팔로워 수 확인
      const followerCount = userData.followerCnt || 0;

      // 팔로워 관련 업적 체크
      if (followerCount >= 1) {
        // 첫 팔로워 업적 달성
        await achievementApi.completeBadge(1);
      }

      if (followerCount >= 30) {
        // 인기 크리에이터 업적 달성
        await achievementApi.completeBadge(2);
      }

      // 사진 평가 관련 통계 가져오기
      const statsResponse = await testApi.get("/api/v1/user/static/me", {});

      const statsData = statsResponse.data.data;

      // 사진 평가 점수 확인
      const avgScore = statsData.scoreAvg || 0;

      if (avgScore >= 77) {
        // 고품질 사진작가 업적 달성
        await achievementApi.completeBadge(9);
      }

      // 사용자 활동 데이터 가져오기
      const activityResponse = await testApi.get(
        "/api/v1/user/time-attack",
        {}
      );

      const activityData = activityResponse.data.data;

      // 각 활동 횟수 확인
      const photoEvalCount = activityData.photoEvalCount || 0;
      const postCount = activityData.postCount || 0;
      const timeAttackCount = activityData.timeAttackCount || 0;
      const timeAttackRank = activityData.timeAttackBestRank || 0;
      const maxLikeCount = activityData.maxPostLikes || 0;

      // 사진 평가 관련 업적 체크
      if (photoEvalCount >= 1) {
        await achievementApi.completeBadge(3);
      }

      if (photoEvalCount >= 30) {
        await achievementApi.completeBadge(4);
      }

      // 게시글 관련 업적 체크
      if (postCount >= 1) {
        await achievementApi.completeBadge(5);
      }

      if (postCount >= 20) {
        await achievementApi.completeBadge(6);
      }

      // 타임어택 관련 업적 체크
      if (timeAttackCount >= 1) {
        await achievementApi.completeBadge(7);
      }

      if (timeAttackCount >= 20) {
        await achievementApi.completeBadge(8);
      }

      if (timeAttackRank === 1) {
        await achievementApi.completeBadge(10);
      }

      // 좋아요 관련 업적 체크
      if (maxLikeCount >= 10) {
        await achievementApi.completeBadge(11);
      }

      // 현재 달성한 업적 조회
      const badgeResponse = await testApi.get("/api/v1/badge", {
        headers: {},
      });

      const badgeData = badgeResponse.data.data;
      const completedBadges = badgeData.filter(
        (badge: any) => badge.isObtain
      ).length;

      // 모든 업적(마스터 제외 11개) 달성 시 마스터 업적도 달성
      if (completedBadges >= 11) {
        await achievementApi.completeBadge(12);
      }

      return true;
    } catch (error) {
      console.error("업적 달성 체크 중 오류 발생:", error);
      return false;
    }
  },

  /**
   * 타임어택 점수를 제출하고 업적 달성 여부를 확인하는 함수
   * @param score 타임어택 점수
   * @returns 업적 달성 여부 응답
   */
  submitTimeAttackScore: async (score: number) => {
    try {
      const response = await testApi.post(
        "/api/v1/badge/time-attack/score",
        { score },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("타임어택 점수 제출 오류:", error);
      throw error;
    }
  },
};
