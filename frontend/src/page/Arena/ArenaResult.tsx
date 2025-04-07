// page/Arena/ArenaResult.tsx
import { useEffect, useState } from "react";
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
                navigate("/ranking?tab=arena", { replace: true });
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
                navigate("/ranking?tab=arena");
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
  const [modalDestination, setModalDestination] = useState<"ranking" | "arena">(
    "ranking"
  ); // 컴포넌트 마운트 시 데이터 확인 및 결과 저장

  useEffect(() => {
    // 세션 스토리지에서 결과 데이터 가져오기
    const storedResult = sessionStorage.getItem("arenaResult");

    if (!storedResult) {
      // 결과 데이터가 없으면 게임 페이지로 리다이렉트
      navigate("/arena");
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult); // 결과 데이터 설정

      setResultData(parsedResult);
      setIsLoading(false); // 결과 자동 저장 - 페이지 로드 시 바로 실행

      saveResult(parsedResult);
    } catch (error) {
      console.error("결과 데이터 파싱 오류:", error);
      navigate("/arena");
    }
  }, [navigate]); // 결과 저장

  const saveResult = async (resultDataParam?: ArenaResultData) => {
    try {
      const dataToUse = resultDataParam || resultData;
      if (!dataToUse) return;

      setIsSaving(true); // 백엔드에 결과 전송

      const requestData: SaveArenaResultRequest = {
        correct: dataToUse.partialCorrectCount, // 맞은 개수 (0~4)
        time: dataToUse.remainingTime, // 남은 시간
      };

      const response = await arenaApi.saveArenaResult(requestData); // 백엔드 응답의 data 필드는 이제 경험치(number)를 직접 포함합니다.

      const responseData = response.data.data; // responseData는 이제 number 타입입니다.
      // responseData (경험치 값)를 직접 사용하여 상태 업데이트
      setXpEarned(responseData); // <--- 수정됨: responseData.xp -> responseData

      console.log("저장 결과 (획득 XP):", responseData); // 로그도 수정된 데이터 반영 // 결과가 이미 저장됨을 표시 (이 로직은 그대로 유지)

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
  }; // 다시 도전하기 핸들러

  const handlePlayAgain = () => {
    sessionStorage.removeItem("arenaResult");
    navigate("/arena");
  }; // 랭킹 보기 핸들러

  const handleViewRanking = () => {
    // 랭킹 페이지로 이동하면서 아레나 탭 선택
    navigate("/ranking?tab=arena", { replace: true });
  }; // 모달 닫기 핸들러

  const handleCloseModal = () => {
    setShowModal(false);
  }; // 로딩 중이면 로딩 화면 표시

  if (isLoading) {
    return (
      <Container>
        <LoadingState />{" "}
      </Container>
    );
  }

  return (
    <Container>
      <ContentNavBar content="아레나 결과" />{" "}
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
