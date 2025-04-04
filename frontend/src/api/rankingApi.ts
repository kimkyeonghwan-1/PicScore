// api/rankingApi.ts
import { testApi } from "./api";

// 랭킹 API 응답 인터페이스
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// 랭킹 데이터 인터페이스
interface RankingData {
  totalPage: number;
  ranking: RankingUser[];
}

// 랭킹 사용자 정보 인터페이스
export interface RankingUser {
  userId: number;
  nickName: string;
  profileImage: string;
  score: number;
  rank: number;
}

export const rankingApi = {
  // 타임어택 랭킹 조회
  getRanking: (pageNum: number) => {
    return testApi.get<BaseResponse<RankingData>>(
      `/api/v1/time-attack/${pageNum}`
    );
  },
};
