import { Outlet } from "react-router-dom";
import BottomBar from "./components/BottomBar/BottomBar";
import RouteListener from "./components/RouteListener";
import useLayoutStore from "./store/layoutStore";
import ContentNavBar from "./components/NavBar/ContentNavBar";
import { usePWAStore } from "./store/pwaStore";
import { useEffect } from "react";
import {
  BeforeInstallPromptEvent,
  NavigatorWithStandalone,
} from "./types/pwaTypes";

function App() {
  const showBottomBar = useLayoutStore((state) => state.showBottomBar);
  const showNavBar = useLayoutStore((state) => state.showNavBar);
  const content = useLayoutStore((state) => state.content);
  const { setInstallPrompt, setIOSDevice } = usePWAStore();

  useEffect(() => {
    console.log("브라우저 세팅 완료");

    // iOS 기기 감지
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIOSDevice(isIOS);

    // 이미 설치된 앱인지 확인
    const nav = window.navigator as NavigatorWithStandalone;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      console.log("이미 설치된 PWA로 실행 중입니다.");
      return;
    }

    if (isIOS) {
      console.log("iOS 기기 감지됨 - 설치 가이드 제공 가능");
      usePWAStore.setState({ isInstallable: true });
    } else {
      console.log("Android/기타 기기 - beforeinstallprompt 이벤트 대기");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 미니 인포바 방지
      e.preventDefault();

      console.log("PWA 설치 가능 상태 감지됨!", e);

      // 나중에 사용할 수 있도록 이벤트 저장
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [setInstallPrompt, setIOSDevice]);

  // 개발 환경에서만 테스트용으로 설정 (필요한 경우)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("개발 환경에서 PWA 설치 버튼 테스트 활성화");
      // 실제 환경에 배포할 때는 아래 라인을 주석 처리하세요
      // usePWAStore.setState({ isInstallable: true });
    }
  }, []);

  return (
    <div className="select-none box-content flex flex-col max-w-md mx-auto min-h-screen bg-gray-50 relative">
      {showNavBar && <ContentNavBar content={content} />}
      <RouteListener />
      <main className="flex flex-1 justify-center">
        <Outlet />
      </main>
      {showBottomBar && <BottomBar />}
    </div>
  );
}

export default App;
