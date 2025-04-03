// page/Arena/Arena.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { arenaApi, ArenaPhoto, ArenaResultData } from "../../api/arenaApi";

// 컴포넌트 임포트
import Container from "./components/Container";
import ExplanationStep from "./components/ExplanationStep";
import PreparationStep from "./components/PreparationStep";
import GameStep from "./components/GameStep";
import LoadingState from "./components/LoadingState";
import Modal from "../../components/Modal";

// 게임 상태 인터페이스
interface GameState {
  isActive: boolean;
  timeLeft: number;
  photos: ArenaPhoto[];
  userOrder: number[];
  completed: boolean;
}

const Arena: React.FC = () => {
  // Local state 관리
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    timeLeft: 20,
    photos: [],
    userOrder: [],
    completed: false,
  });
  const [step, setStep] = useState<number>(1); // 1: Explanation, 2: Preparation, 3: Game
  const [timeLeft, setTimeLeft] = useState<number>(20); // Countdown timer
  const [countdown, setCountdown] = useState<number>(3); // Countdown for preparation
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [photos, setPhotos] = useState<ArenaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  // Handle timer countdown
  useEffect(() => {
    let timer: number | undefined;
    if (isTimerActive && timeLeft > 0) {
      timer = window.setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        // 게임 상태와 timeLeft 동기화
        setGameState((prev) => ({
          ...prev,
          timeLeft: timeLeft - 1,
        }));
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [timeLeft, isTimerActive]);

  // 랜덤 사진 가져오기
  const fetchRandomPhotos = async () => {
    try {
      setIsLoading(true);
      // api/v2/arena/random 엔드포인트 호출
      const response = await arenaApi.getRandomPhotos();
      const data = response.data.data;

      if (!data || !data.photos || data.photos.length !== 4) {
        throw new Error("사진 데이터를 가져오지 못했습니다");
      }

      // 사진 설정
      const photosData = data.photos;
      setPhotos(photosData);

      // 게임 상태 업데이트
      setGameState({
        isActive: true,
        timeLeft: 20,
        photos: photosData,
        userOrder: [],
        completed: false,
      });

      console.log("가져온 사진:", photosData);

      return true;
    } catch (error) {
      console.error("사진 가져오기 오류:", error);
      setError("사진을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async (): Promise<void> => {
    // 게임 시작 로직
    setStep(2);
    setCountdown(3);

    // 3초 카운트다운
    const countdownInterval = window.setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          // 사진 불러오기 및 게임 시작
          startGame();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const startGame = async () => {
    // 사진 불러오기
    const success = await fetchRandomPhotos();

    if (success) {
      // 게임 단계로 진행
      setStep(3);
      // 타이머 시작
      setIsTimerActive(true);
      setTimeLeft(20);
    } else {
      // 오류 시 처음 단계로 돌아가기
      setStep(1);
    }
  };

  const handleTimeUp = (): void => {
    setIsTimerActive(false);
    setGameState((prev) => ({
      ...prev,
      isActive: false,
    }));

    // 결과 계산 및 결과 페이지로 이동
    const result = calculateResult();
    navigateToResult(result);
  };

  const handlePhotoSelect = (photoId: number): void => {
    // 이미 선택된 사진이면 추가하지 않음
    if (gameState.userOrder.includes(photoId)) {
      return;
    }

    // 최대 4개까지만 추가
    if (gameState.userOrder.length >= 4) {
      return;
    }

    const newUserOrder = [...gameState.userOrder, photoId];

    // 모든 사진이 선택되었는지 확인
    const completed = newUserOrder.length === 4;

    setGameState({
      ...gameState,
      userOrder: newUserOrder,
      completed,
    });
  };

  const handleRemoveSelection = (index: number): void => {
    const newUserOrder = [...gameState.userOrder];
    newUserOrder.splice(index, 1);

    setGameState({
      ...gameState,
      userOrder: newUserOrder,
      completed: false,
    });
  };

  const handleSubmit = (): void => {
    // 타이머 중지
    setIsTimerActive(false);
    setGameState((prev) => ({
      ...prev,
      isActive: false,
    }));

    // 결과 계산 및 결과 페이지로 이동
    const result = calculateResult();
    navigateToResult(result);
  };

  // 결과 계산
  const calculateResult = (): ArenaResultData => {
    const { userOrder, photos, timeLeft } = gameState;

    // 점수 순서대로 정렬된 정답 배열 계산
    const correctOrder = [...photos]
      .sort((a, b) => b.score - a.score)
      .map((photo) => photo.id);

    // 전체 정답 여부 확인 (0 또는 1)
    let correctCount = 0;

    // 사용자 선택과 정답 순서 일치 여부 확인
    const isFullyCorrect =
      userOrder.length === correctOrder.length &&
      userOrder.every((id, index) => id === correctOrder[index]);

    if (isFullyCorrect) {
      correctCount = 1;
    }

    // 부분적으로 맞은 개수 계산 (UI 표시용)
    let partialCorrectCount = 0;
    for (let i = 0; i < userOrder.length && i < correctOrder.length; i++) {
      if (userOrder[i] === correctOrder[i]) {
        partialCorrectCount++;
      }
    }

    // 소요 시간 계산 (20초에서 남은 시간 빼기)
    const timeSpent = timeLeft > 0 ? 20 - timeLeft : 20;

    // 점수 계산 (정확한 로직은 백엔드와 일치해야 함)
    // 예시: 모두 맞추면 최대 점수 + 남은 시간 보너스, 아니면 부분 점수
    const score =
      correctCount === 1 ? 100 + timeLeft * 10 : partialCorrectCount * 25;

    return {
      correctCount, // 전체 정답 여부 (0 또는 1)
      partialCorrectCount, // 부분 정답 개수 (0~4)
      timeSpent,
      remainingTime: timeLeft,
      photos: gameState.photos,
      userOrder: gameState.userOrder,
      score,
    };
  };

  // 결과 페이지로 이동
  const navigateToResult = (result: ArenaResultData) => {
    // 세션 스토리지에 결과 저장 (페이지 전환 시 데이터 유지를 위해)
    sessionStorage.setItem("arenaResult", JSON.stringify(result));

    // 결과 페이지로 이동
    navigate("/arena/result");
  };

  // Render different steps of the Arena feature
  const renderStep = (): React.ReactNode => {
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
  };

  return (
    <Container>
      <main className="flex-1 flex flex-col">{renderStep()}</main>

      {/* 에러 모달 */}
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
            textColor: "gray",
            onClick: () => setShowErrorModal(false),
          },
        ]}
      />
    </Container>
  );
};

export default Arena;
