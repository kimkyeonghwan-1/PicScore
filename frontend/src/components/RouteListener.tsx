// src/components/RouteListener.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useLayoutStore from "../store/layoutStore";
import { useGetPhoto } from "../hooks/useBoard";
import { addBreadcrumb } from "@sentry/react";

interface LayoutConfig {
  showNavBar: boolean;
  showBottomBar: boolean;
  content: string;
}
const nickname = "asdf";
const routeLayouts: { [key: string]: LayoutConfig } = {
  "/": { showNavBar: false, showBottomBar: false, content: "" },
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
  "/image-result": {
    showNavBar: true,
    showBottomBar: true,
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
    showNavBar: true,
    showBottomBar: false,
    content: "타임어택",
  },
};

function RouteListener() {
  const location = useLocation();
  const setLayoutVisibility = useLayoutStore(
    (state) => state.setLayoutVisibility
  );

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
      
      // step이 1(설명 단계)일 때만 내브바 표시, 그 외에는 표시하지 않음
      if (step === "1" || step === null) { // step이 없을 때는 처음 로드로 간주
        setLayoutVisibility({
          showNavBar: true,
          showBottomBar: false,
          content: "타임어택",
        });
      } else {
        setLayoutVisibility({
          showNavBar: false, 
          showBottomBar: false,
          content: "타임어택",
        });
      }
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
  }, [location, setLayoutVisibility]);

  return null;
}

export default RouteListener;
