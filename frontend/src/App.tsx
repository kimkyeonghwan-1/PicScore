import { Outlet } from "react-router-dom";
import BottomBar from "./components/BottomBar/BottomBar";
import RouteListener from "./components/RouteListener";
import useLayoutStore from "./store/layoutStore";
import ContentNavBar from "./components/NavBar/ContentNavBar";
import { usePWAStore } from "./store/pwaStore";
import { useEffect } from "react";
function App() {
  const showBottomBar = useLayoutStore((state) => state.showBottomBar);
  const showNavBar = useLayoutStore((state) => state.showNavBar);
  const content = useLayoutStore((state) => state.content);
  const setInstallPrompt = usePWAStore((state) => state.setInstallPrompt);

  useEffect(() => {
    console.log("브라우저 세팅 완료");

    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 미니 인포바 방지
      e.preventDefault();
      // 나중에 사용할 수 있도록 이벤트 저장
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [setInstallPrompt]);

  useEffect(() => {
    // 실제 환경에서는 제거
    if (process.env.NODE_ENV === "development") {
      usePWAStore.setState({ isInstallable: true });
    }
  }, []);

  return (
    <div className=" select-none box-content flex flex-col max-w-md mx-auto min-h-screen bg-gray-50 relative">
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
