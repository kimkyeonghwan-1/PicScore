import React, { useState } from "react";
import { usePWAStore } from "../store/pwaStore";

const InstallPWA: React.FC = () => {
  const { isInstallable, isIOSDevice, installPrompt, clearInstallPrompt } =
    usePWAStore();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      // iOS 디바이스일 경우 설치 가이드 표시
      setShowIOSGuide(true);
      return;
    }

    if (!installPrompt) return;
    console.log("PWA 설치 프롬프트 표시");

    // 설치 프롬프트 표시
    installPrompt.prompt();

    // 사용자의 응답을 기다림
    const { outcome } = await installPrompt.userChoice;
    console.log(`사용자 선택: ${outcome}`);

    // 프롬프트는 한 번만 사용할 수 있으므로 상태 초기화
    clearInstallPrompt();
  };

  // 설치 가능하지 않거나 iOS 가이드를 표시하지 않는 경우
  if (!isInstallable && !isIOSDevice) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="absolute right-0 flex items-center w-24 text-3xl"
      >
        ⭐
      </button>

      {/* iOS 설치 가이드 */}
      {showIOSGuide && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">iOS에서 앱 설치하기</h3>
            <p className="mb-4">
              1. Safari 하단의 "공유" 아이콘을 탭하세요.
              <br />
              2. "홈 화면에 추가" 옵션을 선택하세요.
              <br />
              3. "추가"를 탭하세요.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
