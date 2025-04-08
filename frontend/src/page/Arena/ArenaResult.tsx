// page/Arena/ArenaResult.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  arenaApi,
  ArenaResultData,
  SaveArenaResultRequest,
} from "../../api/arenaApi"; // arenaApi는 수정된 버전을 임포트한다고 가정합니다.

// 컴포넌트 임포트
import Container from "./components/Container";
import LoadingState from "./components/LoadingState";
import ArenaResult from "./components/ArenaResult";
import ContentNavBar from "../../components/NavBar/ContentNavBar";
import BottomBar from "../../components/BottomBar/BottomBar";
import Modal from "../../components/Modal";

// 애니메이션 모달 컴포넌트
interface AnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctCount: number;
  partialCorrectCount: number;
  xpGained: number;
  destination: "ranking" | "arena";
}

const AnimationModal: React.FC<AnimationModalProps> = ({
  isOpen,
  onClose,
  correctCount,
  partialCorrectCount,
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
            clearInterval(countdownInterval); // 카운트다운 완료 후 목적지로 이동
            setTimeout(() => {
              onClose();
              if (destination === "ranking") {
                navigate("/ranking", { replace: true });
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
      {" "}
      <div className="w-full max-w-sm mx-auto">
        {" "}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center animate-fadeIn">
          {" "}
          <h2 className="text-3xl font-bold mb-4 text-white">
            축하합니다!
          </h2>{" "}
          <div className="mb-6">
            <p className="text-xl text-yellow-300">정답 판정</p>{" "}
            <p className="text-5xl font-bold text-white">
              {correctCount > 0 ? "정답!" : "오답"}{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-6">
            <p className="text-xl text-yellow-300">맞은 개수</p>{" "}
            <p className="text-5xl font-bold text-white">
              {partialCorrectCount}/4{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-8">
            <p className="text-xl text-green-300">경험치 획득</p>{" "}
            <div className="flex items-center justify-center">
              {" "}
              <span className="text-5xl font-bold text-white">+{xpGained}</span>
              <span className="text-xl text-white ml-1">XP</span>{" "}
            </div>{" "}
          </div>{" "}
          {countdown > 0 ? (
            <p className="text-gray-200">
              {countdown}초 후{" "}
              {destination === "ranking" ? "랭킹 페이지" : "아레나 페이지"}로
              이동합니다...{" "}
            </p>
          ) : (
            <p className="text-gray-200">이동 중...</p>
          )}{" "}
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
            바로 이동하기{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

const ArenaResultPage: React.FC = () => {
  const navigate = useNavigate(); // 결과 데이터 상태
  const [resultData, setResultData] = useState<ArenaResultData | null>(null); // Local state 관리
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false); // 애니메이션 모달 상태
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalDestination, setModalDestination] = useState<"ranking" | "arena">("ranking");
  
  // 결과가 이미 저장되었는지 추적하는 ref
  const resultSavedRef = useRef<boolean>(false);
  // 페이지를 벗어나는지 감지하는 state
  const [isLeavingPage, setIsLeavingPage] = useState<boolean>(false);

  // 컴포넌트 마운트 시 데이터 확인 및 결과 저장
  useEffect(() => {
    // 세션 스토리지에서 결과 데이터 가져오기
    const storedResult = sessionStorage.getItem("arenaResult");

    if (!storedResult) {
      // 결과 데이터가 없으면 게임 페이지로 리다이렉트
      navigate("/arena");
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);
      
      // 이미 저장된 결과인지 확인
      if (parsedResult.resultSaved) {
        resultSavedRef.current = true;
      }

      // 결과 데이터 설정
      setResultData(parsedResult);
      setIsLoading(false);

      // 결과가 아직 저장되지 않았다면 저장 진행
      if (!parsedResult.resultSaved) {
        saveResult(parsedResult);
      }

      // 브라우저 history state 설정
      window.history.replaceState(
        { resultSaved: true },
        document.title,
        window.location.pathname
      );
    } catch (error) {
      console.error("결과 데이터 파싱 오류:", error);
      navigate("/arena");
    }

    // 브라우저 뒤로가기 이벤트 리스너 등록
    const handlePopState = (event: PopStateEvent) => {
      // 페이지를 벗어나는 상태로 설정
      setIsLeavingPage(true);
      
      // 이미 결과가 저장되었다면 아레나 페이지로 리다이렉트
      if (resultSavedRef.current) {
        navigate("/arena", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // 페이지를 벗어날 때 처리
  useEffect(() => {
    if (isLeavingPage && resultSavedRef.current) {
      navigate("/arena", { replace: true });
    }
  }, [isLeavingPage, navigate]);

  // 결과 저장
  const saveResult = async (resultDataParam?: ArenaResultData) => {
    try {
      const dataToUse = resultDataParam || resultData;
      if (!dataToUse) return;
      
      // 이미 결과가 저장되었다면 저장 건너뛰기
      if (resultSavedRef.current) {
        return;
      }

      setIsSaving(true); // 백엔드에 결과 전송

      const requestData: SaveArenaResultRequest = {
        correct: dataToUse.partialCorrectCount, // 맞은 개수 (0~4)
        time: dataToUse.remainingTime, // 남은 시간
      };

      const response = await arenaApi.saveArenaResult(requestData);
      const responseData = response.data.data;
      setXpEarned(responseData);

      console.log("저장 결과 (획득 XP):", responseData);

      // 결과가 저장되었음을 표시
      resultSavedRef.current = true;
      const updatedResultData = { ...dataToUse, resultSaved: true };
      setResultData(updatedResultData);
      sessionStorage.setItem("arenaResult", JSON.stringify(updatedResultData));
    } catch (error) {
      console.error("결과 저장 실패:", error);
      setError("결과 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  // 다시 도전하기 핸들러
  const handlePlayAgain = () => {
    sessionStorage.removeItem("arenaResult");
    navigate("/arena", { replace: true });
  };

  // 랭킹 보기 핸들러
  const handleViewRanking = () => {
    // 모달 표시 없이 바로 랭킹 페이지로 이동
    navigate("/ranking", { replace: true });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <Container>
        <LoadingState />{" "}
      </Container>
    );
  }

  return (
    <Container>
      {" "}
      <main className="flex-1">
        {" "}
        {resultData && (
          <ArenaResult
            score={resultData.score}
            userOrder={resultData.userOrder}
            correctOrder={resultData.photos
              .sort((a, b) => b.score - a.score)
              .map((photo) => photo.id)}
            photos={resultData.photos}
            timeSpent={resultData.timeSpent}
            correctCount={resultData.correctCount}
            partialCorrectCount={resultData.partialCorrectCount}
            xpEarned={xpEarned}
            onPlayAgain={handlePlayAgain}
            onViewRanking={handleViewRanking}
            isSaving={isSaving}
          />
        )}{" "}
      </main>
      <BottomBar /> {/* 애니메이션 모달 */}{" "}
      <AnimationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        correctCount={resultData?.correctCount || 0}
        partialCorrectCount={resultData?.partialCorrectCount || 0}
        xpGained={xpEarned}
        destination={modalDestination}
      />
      {/* 에러 모달 */}{" "}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="오류"
        description={
          <div className="text-gray-600">
            <p>{error}</p>{" "}
          </div>
        }
        buttons={[
          {
            label: "확인",
            textColor: "gray",
            onClick: () => setShowErrorModal(false),
          },
        ]}
      />{" "}
    </Container>
  );
};

export default ArenaResultPage;
