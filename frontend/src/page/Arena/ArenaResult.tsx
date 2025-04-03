// page/Arena/ArenaResult.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useArenaStore } from "../../store/arenaStore";
import { arenaApi } from "../../api/arenaApi";

// 컴포넌트 임포트
import Container from "./components/Container";
import LoadingState from "./components/LoadingState";
import ArenaResult from "./components/ArenaResult";
import ContentNavBar from "../../components/NavBar/ContentNavBar";
import BottomBar from "../../components/BottomBar/BottomBar";

// 애니메이션 모달 컴포넌트
interface AnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctCount: number;
  score: number;
  xpGained: number;
  destination: "ranking" | "arena";
}

const AnimationModal: React.FC<AnimationModalProps> = ({
  isOpen,
  onClose,
  correctCount,
  score,
  xpGained,
  destination,
}) => {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // XP 표시 후 카운트다운 시작
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // 카운트다운 완료 후 목적지로 이동
            setTimeout(() => {
              onClose();
              if (destination === "ranking") {
                navigate("/ranking");
              } else {
                navigate("/arena");
              }
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isOpen, navigate, onClose, destination]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center animate-fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-white">축하합니다!</h2>
          <div className="mb-6">
            <p className="text-xl text-yellow-300">정답 개수</p>
            <p className="text-5xl font-bold text-white">{correctCount}/4</p>
          </div>
          <div className="mb-6">
            <p className="text-xl text-yellow-300">획득 점수</p>
            <p className="text-5xl font-bold text-white">{score}</p>
          </div>
          <div className="mb-8">
            <p className="text-xl text-green-300">경험치 획득</p>
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-white">+{xpGained}</span>
              <span className="text-xl text-white ml-1">XP</span>
            </div>
          </div>
          {countdown > 0 ? (
            <p className="text-gray-200">
              {countdown}초 후{" "}
              {destination === "ranking" ? "랭킹 페이지" : "아레나 페이지"}로
              이동합니다...
            </p>
          ) : (
            <p className="text-gray-200">이동 중...</p>
          )}
          <button
            onClick={() => {
              onClose();
              if (destination === "ranking") {
                navigate("/ranking");
              } else {
                navigate("/arena");
              }
            }}
            className="mt-4 bg-pic-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pic-primary/90 transition"
          >
            바로 이동하기
          </button>
        </div>
      </div>
    </div>
  );
};

const ArenaResultPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Zustand store 사용
  const { gameState, result, resetAll } = useArenaStore();
  
  // Local state 관리
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 모달 상태
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalDestination, setModalDestination] = useState<"ranking" | "arena">("ranking");

  // 컴포넌트 마운트 시 데이터 확인
  useEffect(() => {
    // 결과 또는 게임 상태가 없으면 게임 페이지로 리다이렉트
    if (!result || !gameState.photos || gameState.photos.length === 0) {
      navigate("/arena");
      return;
    }
    
    setIsLoading(false);
  }, [result, gameState, navigate]);

  // 결과 저장
  const saveResult = useCallback(async () => {
    try {
      if (!result) return;
      
      setIsSaving(true);
      
      // 1. 아레나 결과 저장 API 호출
      await arenaApi.saveArenaResult({
        time: result.timeSpent,
        score: result.score,
        correctCount: result.correctCount,
      });
      
      // 여기서는 정답 개수를 기준으로 랭킹에 저장합니다.
      console.log(`정답 개수: ${result.correctCount}개, 소요 시간: ${result.timeSpent}초, 점수: ${result.score}점`);
      
      // 애니메이션 모달 표시 (저장 성공 후)
      setModalDestination("ranking");
      setShowModal(true);
    } catch (error) {
      console.error("결과 저장 실패:", error);
      setError("결과 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [result]);

  // 다시 도전하기 핸들러
  const handlePlayAgain = useCallback(() => {
    resetAll();
    navigate("/arena");
  }, [resetAll, navigate]);

  // 랭킹 보기 핸들러
  const handleViewRanking = useCallback(async () => {
    await saveResult();
  }, [saveResult]);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // 메모이제이션된 렌더링 컨텐츠
  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <Container>
          <LoadingState />
        </Container>
      );
    }

    return (
      <Container>
        <ContentNavBar content="아레나 결과" />
        <main className="flex-1">
          {result && gameState.photos && gameState.photos.length > 0 && (
            <ArenaResult
              score={result.score}
              userOrder={gameState.userOrder}
              correctOrder={gameState.correctOrder}
              photos={gameState.photos}
              timeSpent={result.timeSpent}
              correctCount={result.correctCount}
              xpEarned={result.xpEarned}
              onPlayAgain={handlePlayAgain}
              onViewRanking={handleViewRanking}
              isSaving={isSaving}
            />
          )}
        </main>
        <BottomBar />
      </Container>
    );
  }, [
    isLoading, 
    result, 
    gameState, 
    handlePlayAgain, 
    handleViewRanking, 
    isSaving
  ]);

  // 애니메이션 모달 렌더링
  const renderModal = useMemo(() => (
    <AnimationModal
      isOpen={showModal}
      onClose={handleCloseModal}
      correctCount={result?.correctCount || 0}
      score={result?.score || 0}
      xpGained={result?.xpEarned || 0}
      destination={modalDestination}
    />
  ), [showModal, handleCloseModal, result, modalDestination]);

  return (
    <>
      {renderContent}
      {renderModal}
    </>
  );
};

export default ArenaResultPage;
