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

// 아레나 결과 저장 요청 인터페이스
interface SaveArenaResultRequest {
  time: number;
  score: number;
  correctCount: number;
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
  score: number;
  rank: number;
}

export const arenaApi = {
  // 무작위 사진 4개 가져오기
  getRandomPhotos: () => {
    return testApi.get<BaseResponse<ArenaPhoto[]>>("/api/v1/arena/photos");
  },

  // 아레나 결과 저장
  saveArenaResult: (data: SaveArenaResultRequest) => {
    return testApi.post<BaseResponse<void>>("/api/v1/arena/result", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // 아레나 랭킹 조회
  getArenaRanking: (pageNum: number) => {
    return testApi.get<BaseResponse<ArenaRankingData>>(
      `/api/v1/arena/ranking/${pageNum}`
    );
  },
};
