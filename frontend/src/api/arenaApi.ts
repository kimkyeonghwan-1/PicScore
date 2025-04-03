// api/arenaApi.ts
import { testApi } from "./api";
import { Photo } from "./boardApi";

// 아레나 API 응답 인터페이스
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// 아레나 사진 응답 인터페이스
export interface ArenaPhoto extends Photo {
  score: number;
}

// 랜덤 사진 응답 인터페이스
export interface RandomPhotosResponse {
  photos: ArenaPhoto[]; // 사진 목록
}

// 아레나 결과 저장 요청 인터페이스
export interface SaveArenaResultRequest {
  time: number; // 남은 시간
  correct: number; // 정확히 맞춘 개수 (0~4)
}

// 아레나 결과 응답 인터페이스
export interface ArenaResultResponse {
  xp: number; // 경험치
}

// 아레나 랭킹 정보 인터페이스
export interface ArenaRankingData {
  totalPage: number;
  ranking: ArenaRankingUser[];
}

// 아레나 랭킹 사용자 정보 인터페이스
export interface ArenaRankingUser {
  userId: number;
  nickName: string;
  profileImage: string;
  score: number; // API 호환을 위해 남기지만 UI에서는 표시하지 않음
  rank: number;
  correct: number; // 4개 전체를 맞춰서 플레이한 횟수
}

// 아레나 결과 인터페이스 (컴포넌트 간 데이터 전달용)
export interface ArenaResultData {
  correctCount: number; // 전체 정답 여부 (0 또는 1) - 백엔드에서는 사용하지 않음
  correct: number; // 부분 정답 개수 (0~4)
  timeSpent: number; // 소요 시간
  remainingTime: number; // 남은 시간
  photos: ArenaPhoto[]; // 사진 목록
  userOrder: number[]; // 사용자가 선택한 순서
  score: number; // 점수
}

export const arenaApi = {
  // 무작위 사진 4장 가져오기
  getRandomPhotos: () => {
    return testApi.get<BaseResponse<RandomPhotosResponse>>(
      "/api/v2/arena/random"
    );
  },

  // 아레나 결과 저장
  saveArenaResult: (data: SaveArenaResultRequest) => {
    return testApi.post<BaseResponse<ArenaResultResponse>>(
      "/api/v2/arena/result",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },

  // 아레나 랭킹 조회
  getArenaRanking: (pageNum: number) => {
    return testApi.get<BaseResponse<ArenaRankingData>>(
      `/api/v2/arena/ranking/${pageNum}`
    );
  },
};
