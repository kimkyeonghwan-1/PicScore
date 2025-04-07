// api/timeAttackApi.ts
import { testApi } from "./api";

// 타임어택 API 응답 인터페이스
interface BaseResponse<T> {
  timeStamp: string;
  message: string;
  data: T;
}

// 사진 분석 응답 인터페이스
interface AnalysisResponse {
  name: string;
  confidence: number;
  score: number; // 추가된 점수 필드
}

// 랭킹 데이터 인터페이스
interface RankingData {
  totalPage: number;
  ranking: RankingUser[];
}

// 랭킹 사용자 정보 인터페이스
interface RankingUser {
  userId: number;
  nickName: string;
  profileImage: string;
  score: number;
  rank: number;
}

// 타임어택 결과 저장 요청 인터페이스
interface SaveTimeAttackRequest {
  imageName: string;
  topic: string;
  score: number;
}

// 이미지 업로드 응답 인터페이스
interface UploadPhotoResponse {
  imageUrl: string;
  imageName: string;
}

export const timeAttackApi = {
  // 타임어택 랭킹 조회
  getRanking: (pageNum: number) => {
    console.log("타임어택 랭킹 조회 API 호출", `/api/v1/time-attack/${pageNum}`);
    return testApi.get<BaseResponse<RankingData>>(
      `/api/v1/time-attack/${pageNum}`
    );
  },

  // 사진 임시 저장 - S3에 업로드
  uploadPhoto: (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    return testApi.post<BaseResponse<UploadPhotoResponse>>(
      "/api/v1/photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // 사진 영구 저장 - 이미지 URL, 점수 등의 정보 저장
  savePhoto: (data: {
    imageUrl: string;
    imageName: string;
    score: number;
    analysisChart?: string;
    analysisText?: string;
    isPublic: boolean;
    photoType: string;
  }) => {
    return testApi.post<BaseResponse<any>>("/api/v1/photo/save", data);
  },

  // 사진 연관도 분석
  analyzePhoto: (imageFile: File, topic: string, timeleft: number) => {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    formData.append("topic", topic);
    formData.append("time", timeleft.toString()); // 남은 시간 추가

    return testApi.post<BaseResponse<AnalysisResponse>>(
      "/api/v1/time-attack/analysis",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // 타임어택 결과 저장
  saveTimeAttackResult: (data: SaveTimeAttackRequest) => {
    return testApi.post<BaseResponse<void>>("/api/v1/time-attack/save", data, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: function (status) {
        return status >= 200 && status < 400; // 302 포함 성공으로 처리
      },
    });
  },

  // 내 타임어택 기록 조회
  getMyTimeAttackHistory: () => {
    return testApi.get<BaseResponse<any>>("/api/v1/time-attack/my-history");
  },

  // 특정 사용자의 타임어택 기록 조회
  getUserTimeAttackHistory: (userId: number) => {
    return testApi.get<BaseResponse<any>>(
      `/api/v1/time-attack/user-history/${userId}`
    );
  },
};
