import { testApi } from "./api";

// 치킨받기 요청에 필요한 타입 정의
interface ChickenRequestDto {
  phoneNumber: string;
  message: string;
}

// API 응답 타입 정의
interface BaseResponse<T> {
  data: T;
  message: string;
  status: number;
  statusText: string;
  timeStamp: string;
}

export const chickenService = {
  // 치킨받기 요청을 서버에 전송
  requestChicken: (data: ChickenRequestDto) => {
    return testApi.post<BaseResponse<void>>(
      "/api/v1/user/chicken/request",
      data
    );
  },

  // 치킨 요청 목록 조회 (관리자용, 임시)
  getChickenRequests: () => {
    return testApi.get<BaseResponse<ChickenRequestDto[]>>(
      "/api/v1/user/chicken/requests"
    );
  },
};
