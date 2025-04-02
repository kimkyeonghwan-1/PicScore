import axios from "axios";
import { useAuthStore } from "../store";
import { captureException } from "../utils/sentry";
import { useNavigate } from "react-router-dom";

const getAuthStore = () => {
  return useAuthStore.getState();
};
const baseURL = import.meta.env.VITE_BASE_URL;
export const evalTestApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

evalTestApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorStatus = error.response.status;
      const errorData = error.response.data;
      const requestUrl = error.config.url;

      captureException(error, {
        source: "eval-api",
        type: "http-error",
        status: errorStatus,
        endpoint: requestUrl,
        response: JSON.stringify(errorData).slice(0, 200),
      });
    } else if (error.request) {
      captureException(error, {
        source: "eval-api",
        type: "network-error",
        url: error.config?.url,
      });
    } else {
      // 일반 클라이언트 오류 Sentry에 보고
      captureException(error, {
        source: "eval-api",
        type: "client-error",
        message: error.message,
      });

      console.error("클라이언트 에러", error.message);
    }

    return Promise.reject(error);
  }
);

export const testApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 치킨받기 API - 토큰 인증 없이 사용 가능한 공개 API

testApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorStatus = error.response.status;
      const errorData = error.response.data;
      const requestUrl = error.config.url;
      const authStore = getAuthStore();

      captureException(error, {
        source: "api",
        type: "http-error",
        status: errorStatus,
        endpoint: requestUrl,
        response: JSON.stringify(errorData).slice(0, 200), // 너무 긴 응답은 자름
      });

      switch (errorStatus) {
        case 400:
          console.error(`${errorStatus} 오류`);
          authStore.logout();
          window.location.replace("/login");
          break;
        case 401:
          console.error(`${errorStatus} Unauthorized: 인증 오류`);
          authStore.logout();
          window.location.replace("/login");
          break;
        case 403:
          console.error(`${errorStatus} Forbidden: 권한 오류`);
          break;
        case 404:
          console.error(
            `${errorStatus} Not Found: 요청한 리소스가 서버에 없음`
          );
          break;
        case 422:
          console.error(
            `${errorStatus} Unprocessable Entity: 요청은 유효하나 처리 실패`
          );
          break;
      }
    } else if (error.request) {
      console.error("네트워크 에러:", error.request);

      captureException(error, {
        source: "api",
        type: "network-error",
        url: error.config?.url,
      });
    } else {
      console.error("클라이언트 에러", error.message);
      captureException(error, {
        source: "api",
        type: "client-error",
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);
