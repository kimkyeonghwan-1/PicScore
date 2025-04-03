// page/Arena/Arena.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useArenaStore } from "../../store/arenaStore";
import { arenaApi, ArenaPhoto } from "../../api/arenaApi";

// 컴포넌트 임포트
import Container from "./components/Container";
import ExplanationStep from "./components/ExplanationStep";
import PreparationStep from "./components/PreparationStep";
import GameStep from "./components/GameStep";
import LoadingState from "./components/LoadingState";
import ContentNavBar from "../../components/NavBar/ContentNavBar";
import BottomBar from "../../components/BottomBar/BottomBar";
import Modal from "../../components/Modal";

const Arena: React.FC = () => {
  // Zustand store 사용
  const {
    gameState,
    setGameState,
    addToUserOrder,
    removeFromUserOrder,
    resetUserOrder,
    setResult,
    resetAll,
  } = useArenaStore();

  // Local state 관리
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1); // 1: Explanation, 2: Preparation, 3: Game
  const [timeLeft, setTimeLeft] = useState<number>(30); // Countdown timer
  const [countdown, setCountdown] = useState<number>(3); // Countdown for preparation
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [photos, setPhotos] = useState<ArenaPhoto[]>([]);
  const [correctOrder, setCorrectOrder] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  // 결과 계산 및 저장
  const calculateAndSaveResult = useCallback((): void => {
    const { userOrder, correctOrder } = gameState;

    // 맞은 개수 계산
    let correctCount = 0;
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i] === correctOrder[i]) {
        correctCount++;
      }
    }

    // 점수 계산
    let score = 0;
    if (correctCount === 4) {
      // 모두 맞춘 경우: 100점 + 남은 시간 보너스
      score = 100 + timeLeft * 10;
    } else {
      // 일부만 맞춘 경우: 맞은 개수 * 25점
      score = correctCount * 25;
    }

    // 경험치 계산
    const xpEarned = Math.floor(score * 1.2);

    // 소요 시간 계산 (30초에서 남은 시간 빼기)
    const timeSpent = timeLeft > 0 ? 30 - timeLeft : 30;

    // 결과 저장
    setResult({
      score,
      correctCount,
      timeSpent,
      xpEarned,
    });

    // API 호출은 결과 페이지에서 처리
  }, [gameState, timeLeft, setResult]);

  const handleTimeUp = useCallback((): void => {
    setIsTimerActive(false);
    setGameState({ isActive: false });

    // 결과 계산 및 저장
    calculateAndSaveResult();

    // 결과 페이지로 이동
    navigate("/arena/result");
  }, [setGameState, navigate, calculateAndSaveResult]);

  // 타이머 카운트다운 처리
  useEffect(() => {
    let timer: number | undefined;
    if (isTimerActive && timeLeft > 0) {
      timer = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        // Zustand에도 현재 시간 업데이트
        setGameState({ timeLeft: timeLeft - 1 });
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [timeLeft, isTimerActive, setGameState, handleTimeUp]);

  // 컴포넌트 언마운트 시 모든 상태 초기화
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  // 랜덤 사진 가져오기
  const fetchRandomPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await arenaApi.getRandomPhotos();
      const fetchedPhotos = response.data.data;

      if (!fetchedPhotos || fetchedPhotos.length !== 4) {
        throw new Error("4장의 사진을 가져오지 못했습니다");
      }

      // 사진 설정
      setPhotos(fetchedPhotos);

      // 정답 순서 계산 (점수 높은 순서)
      const sortedIds = [...fetchedPhotos]
        .sort((a, b) => b.score - a.score)
        .map((photo) => photo.id);

      setCorrectOrder(sortedIds);

      // Zustand 상태 업데이트
      setGameState({
        photos: fetchedPhotos,
        correctOrder: sortedIds,
        isActive: true,
      });

      return true;
    } catch (error) {
      console.error("사진 가져오기 오류:", error);
      setError("사진을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setGameState]);

  // 비동기 처리 최적화
  const startGameWithTimeout = useCallback((onComplete: () => void) => {
    // requestAnimationFrame 사용하여 성능 향상
    requestAnimationFrame(() => {
      setTimeout(onComplete, 0);
    });
  }, []);

  // 게임 시작 - 사진 가져오기 및 게임 진행
  const startGame = useCallback(async () => {
    // 사진 불러오기
    const success = await fetchRandomPhotos();

    if (success) {
      // 게임 단계로 진행
      setStep(3);
      // 타이머 시작
      setIsTimerActive(true);
      setTimeLeft(30);

      // Zustand 상태 업데이트
      setGameState({
        isActive: true,
        timeLeft: 30,
      });
    } else {
      // 오류 시 처음 단계로 돌아가기
      setStep(1);
    }
  }, [fetchRandomPhotos, setGameState]);

  const handleStartGame = useCallback(async (): Promise<void> => {
    // 게임 시작 로직
    setStep(2);
    setCountdown(3);

    // 3초 카운트다운
    const countdownInterval = window.setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          // 사진 불러오기 및 게임 시작
          startGameWithTimeout(startGame);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  }, [startGame, startGameWithTimeout]);

  const handlePhotoSelect = useCallback((photoId: number): void => {
    addToUserOrder(photoId);
  }, [addToUserOrder]);

  const handleRemoveSelection = useCallback((index: number): void => {
    removeFromUserOrder(index);
  }, [removeFromUserOrder]);

  const handleSubmit = useCallback((): void => {
    // 타이머 중지
    setIsTimerActive(false);
    setGameState({ isActive: false });

    // 결과 계산 및 저장
    calculateAndSaveResult();

    // 결과 페이지로 이동
    navigate("/arena/result");
  }, [setGameState, navigate, calculateAndSaveResult]);

  // 렌더링 함수 최적화
  const renderStep = useCallback((): React.ReactNode => {
    if (isLoading && step !== 1) {
      return <LoadingState />;
    }

    switch (step) {
      case 1: // Explanation
        return <ExplanationStep onStartGame={handleStartGame} />;

      case 2: // Preparation/Countdown
        return <PreparationStep countdown={countdown} />;

      case 3: // Game
        return (
          <GameStep
            timeLeft={timeLeft}
            photos={photos}
            userOrder={gameState.userOrder}
            onPhotoSelect={handlePhotoSelect}
            onRemoveSelection={handleRemoveSelection}
            onSubmit={handleSubmit}
            isComplete={gameState.completed}
          />
        );

      default:
        return <div>에러가 발생했습니다.</div>;
    }
  }, [step, isLoading, countdown, timeLeft, photos, gameState.userOrder, gameState.completed, 
      handleStartGame, handlePhotoSelect, handleRemoveSelection, handleSubmit]);

  // 컨테이너 및 모달 UI 추가 최적화
  const renderModal = useMemo(() => (
    <Modal
      isOpen={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title="오류"
      description={
        <div className="text-gray-600">
          <p>{error}</p>
        </div>
      }
      buttons={[
        {
          label: "확인",
          textColor: "black",
          onClick: () => setShowErrorModal(false),
        },
      ]}
    />
  ), [showErrorModal, error]);

  return (
    <Container>
      {step !== 1 && <ContentNavBar content="사진 점수 맞추기" />}
      <main className="flex-1 flex flex-col">{renderStep()}</main>
      {step !== 1 && <BottomBar />}

      {/* 에러 모달 */}
      {renderModal}
    </Container>
  );
};

export default Arena;
