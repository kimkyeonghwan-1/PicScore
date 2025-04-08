// src/components/RouteListener.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useLayoutStore from "../store/layoutStore";
import { useGetPhoto } from "../hooks/useBoard";
import { addBreadcrumb } from "@sentry/react";
import { useAuthStore } from "../store/authStore"; // 인증 상태를 가져오기 위한 import 추가

interface LayoutConfig {
  showNavBar: boolean;
  showBottomBar: boolean;
  content: string;
}
const nickname = "asdf";
const routeLayouts: { [key: string]: LayoutConfig } = {
  "/": { showNavBar: false, showBottomBar: true, content: "" },
  "/image-upload": {
    showNavBar: true,
    showBottomBar: false,
    content: "사진 분석",
  },
  "/login": {
    showNavBar: false,
    showBottomBar: false,
    content: "로그인",
  },
  // image-result 경로는 동적으로 처리할 것이므로 여기서는 기본값만 정의
  "/image-result": {
    showNavBar: true,
    showBottomBar: true, // 기본값, 실제로는 로그인 상태에 따라 결정
    content: "분석 결과",
  },
  "/welcome": {
    showNavBar: false,
    showBottomBar: false,
    content: "환영합니다",
  },
  "/board": {
    showNavBar: false,
    showBottomBar: true,
    content: "게시글",
  },
  "/photo/:number": {
    showNavBar: true,
    showBottomBar: true,
    content: "게시글",
  },
  "/mypage": {
    showNavBar: true,
    showBottomBar: true,
    content: "마이페이지",
  },
  "/user/profile": {
    showNavBar: true,
    showBottomBar: true,
    content: "프로필",
  },
  "/user/profile/:userId": {
    showNavBar: true,
    showBottomBar: true,
    content: "프로필",
  },
  "/ranking": {
    showNavBar: true,
    showBottomBar: true,
    content: "랭킹",
  },
  "/archieve": {
    showNavBar: true,
    showBottomBar: false,
    content: "업적",
  },
  "/search/:search": {
    showNavBar: false,
    showBottomBar: true,
    content: "검색",
  },
  "/time-attack": {
    showNavBar: false,
    showBottomBar: false,
    content: "타임어택",
  },
  "/arena": {
    showNavBar: true,
    showBottomBar: false,
    content: "아레나",
  },
  // 새로운 통합 팔로우 페이지 추가
  "/follow": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로우",
  },
  "/user/follow/:userId": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로우",
  },
  // 기존 페이지 유지 (리다이렉트 처리를 위해)
  "/following": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로잉",
  },
  "/follower": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로워",
  },
  "/user/following/:userId": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로잉",
  },
  "/user/follower/:userId": {
    showNavBar: true,
    showBottomBar: false,
    content: "팔로워",
  },
};

function RouteListener() {
  const location = useLocation();
  const setLayoutVisibility = useLayoutStore(
    (state) => state.setLayoutVisibility
  );
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); // 로그인 상태 가져오기

  useEffect(() => {
    //Sentry 브레드크럼 추가( 페이지 이동 추적)
    addBreadcrumb({
      message: `페이지 이동: ${location.pathname}`,
      category: "navigation",
      level: "info",
      timestamp: Date.now() / 1000,
    });

    // 타임어택 특별 처리 - URL의 step 매개변수 확인
    if (location.pathname === "/time-attack") {
      const params = new URLSearchParams(location.search);
      const step = params.get("step");

      // step이 "1"이거나 null인 경우에만 내브바 표시
      if (step === "1" || step === null) {
        setLayoutVisibility({
          showNavBar: true,
          showBottomBar: false,
          content: "타임어택",
        });
      } else if (step === "2" || step === "3") {
        // step이 2 또는 3인 경우 내브바 숨김
        setLayoutVisibility({
          showNavBar: false,
          showBottomBar: false,
          content: "타임어택",
        });
      }
      return;
    }

    // 이미지 결과 페이지 특별 처리 - 로그인 상태에 따라 하단바 표시 여부 결정
    if (location.pathname === "/image-result") {
      setLayoutVisibility({
        showNavBar: true,
        showBottomBar: isLoggedIn, // 로그인 상태일 때만 하단바 표시
        content: "분석 결과",
      });
      return;
    }

    // 홈 경로 특별 처리 - loginSuccess 쿼리 파라미터 확인
    if (location.pathname === "/") {
      const searchParams = new URLSearchParams(location.search);
      const loginSuccess = searchParams.get('loginSuccess');
      
      setLayoutVisibility({
        showNavBar: false,
        showBottomBar: isLoggedIn || loginSuccess === 'true', // 로그인 상태 또는 loginSuccess가 true일 때만 하단바 표시
        content: "",
      });
      return;
    }

    // 현재 경로에 맞는 레이아웃 설정 찾기
    const currentPath = Object.keys(routeLayouts).find(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + "/")
    );

    // 해당 경로의 레이아웃 설정 적용 또는 기본값 적용
    if (currentPath) {
      setLayoutVisibility(routeLayouts[currentPath]);
    } else {
      setLayoutVisibility({
        showNavBar: false,
        showBottomBar: false,
        content: "안됐어요",
      });
    }
  }, [location, setLayoutVisibility, isLoggedIn]); // isLoggedIn 의존성 추가

  return null;
}

export default RouteListener;
