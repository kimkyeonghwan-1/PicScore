import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messages = [
    "환영합니다!",
    <>
      직접 찍으신 사진을 <br /> 평가해 드려요!{" "}
    </>,
    <>
      다른사람들과 경쟁하며 <br />
      사진 실력을 키워보세요!!!
    </>,
  ];

  // 메시지 전환 함수
  const goToNextMessage = () => {
    if (isTransitioning) return; // 전환 중이면 무시

    setIsTransitioning(true);

    // 페이드 아웃 효과를 위한 지연 시간
    setTimeout(() => {
      if (activeIndex === messages.length - 1) {
        // 마지막 페이지에서는 로그인 페이지로 이동
        navigate("/login");
        return;
      }

      setActiveIndex((prevIndex) => prevIndex + 1);

      // 페이드 인 효과를 위한 전환 상태 해제
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50); // 상태 업데이트 후 약간의 지연
    }, 500); // 페이드 아웃에 맞춘 지연
  };

  // 타이머 시작 함수
  const startTimer = () => {
    // 기존 타이머가 있다면 제거
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // 새 타이머 설정 - 3초 후 다음 메시지로 전환
    timerRef.current = setTimeout(() => {
      goToNextMessage();
    }, 3000);
  };

  useEffect(() => {
    // 전환 중이 아닐 때만 타이머 시작
    if (!isTransitioning) {
      startTimer();
    }

    return () => {
      // 컴포넌트 언마운트 시 타이머 정리
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeIndex, isTransitioning]); // activeIndex나 isTransitioning이 변경될 때마다 실행

  const handleClick = () => {
    // 전환 중이면 클릭 무시
    if (isTransitioning) return;

    // 타이머 취소
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 마지막 메시지인 경우
    if (activeIndex === messages.length - 1) {
      navigate("/login");
      return;
    }

    // 다음 메시지로 전환
    goToNextMessage();
  };

  return (
    <div
      className="w-full  flex flex-col  items-center justify-center h-screen bg-white cursor-pointer"
      onClick={handleClick}
    >
      {/* PIC (초록) SCORE (검정) 로고 */}
      <div className="mb-20 text-5xl font-logo">
        <span className="text-pic-primary">PIC</span>
        <span className="text-black">SCORE</span>
      </div>

      {/* 메시지 컨테이너 - Tailwind의 트랜지션 클래스 사용 */}
      <div
        className={`text-center w-full font-bold transition-all duration-500 ease-in-out transform ${
          isTransitioning
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        {activeIndex === 0 && (
          <div className="text-4xl w-full text-black  mb-6 ">{messages[0]}</div>
        )}

        {activeIndex === 1 && (
          <div className="text-2xl w-full text-black  mb-6 whitespace-pre-line">
            {messages[1]}
          </div>
        )}

        {activeIndex === 2 && (
          <div className="text-2xl w-full text-black px-6 max-w-lg mb-6 whitespace-pre-line">
            {messages[2]}
            <div className="text-sm text-gray-600 mt-6">
              직접 사진을 찍고 점수 확인해 보세요!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Welcome;
