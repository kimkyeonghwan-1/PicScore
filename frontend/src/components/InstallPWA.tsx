import React from "react";
import { usePWAStore } from "../store/pwaStore";

const InstallPWA: React.FC = () => {
  const { isInstallable, installPrompt, clearInstallPrompt } = usePWAStore();

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    console.log(1234);

    // 설치 프롬프트 표시
    installPrompt.prompt();

    // 사용자의 응답을 기다림
    const { outcome } = await installPrompt.userChoice;
    console.log(`사용자 선택: ${outcome}`);

    // 프롬프트는 한 번만 사용할 수 있으므로 상태 초기화
    clearInstallPrompt();
  };

  // 설치 가능한 상태일 때만 버튼 표시
  // if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className=" absolute right-0 flex items-center w-24 text-3xl"
    >
      ⭐
    </button>
  );
};

export default InstallPWA;
