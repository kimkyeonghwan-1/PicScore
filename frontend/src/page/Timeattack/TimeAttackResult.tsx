// TimeAttackResult.tsx 파일에 적용할 전체적인 수정사항

import { achievementApi } from "../../api/achievementApi";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTimeAttackStore } from "../../store/timeAttackStore";
import { useAchievementCheck } from "../../hooks/useAchievement";

// 주제 영어-한글 매핑
const TOPIC_TRANSLATIONS: Record<string, string> = {
  dog: "강아지",
  cat: "고양이",
  flower: "꽃",
  car: "자동차",
  tree: "나무",
  food: "음식",
  mountain: "산",
  sky: "하늘",
  book: "책",
  cup: "컵",
  chair: "의자",
  clock: "시계",
  computer: "컴퓨터",
  plant: "식물",
  table: "테이블",
  building: "건물",
  shoes: "신발",
  pavement: "포장도로",
  mouse: "마우스",
  door: "문",
  window: "창문",
  clothes: "옷",
  bag: "가방",
  phone: "전화기",
  keyboard: "키보드",
  Screen: "스크린",
};

const translateTopic = (englishTopic: string): string => {
  return TOPIC_TRANSLATIONS[englishTopic] || englishTopic; // 매핑이 없으면 원래 값 반환
};

// 컴포넌트 임포트
import Container from "./components/Container";
import LoadingState from "./components/LoadingState";
import FailureResult from "./components/FailureResult";
import SuccessResult from "./components/SuccessResult";
import { LocationState } from "../../types";
import { TimeAttackResultData } from "../../types";
import { timeAttackApi } from "../../api/timeAttackApi";
import BottomBar from "../../components/BottomBar/BottomBar";

// 애니메이션 모달 컴포넌트
interface AnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  xpGained: number;
  destination: "ranking" | "timeattack";
}

const AnimationModal: React.FC<AnimationModalProps> = ({
  isOpen,
  onClose,
  score,
  xpGained,
  destination,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToRanking = () => {
    onClose();
    navigate("/ranking?tab=timeAttack", { replace: true });
  };

  const handleGoToTimeAttack = () => {
    onClose();
    navigate("/time-attack");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center animate-fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-white">축하합니다!</h2>
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

          {/* 버튼 그룹 - 두 개의 버튼 */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleGoToRanking}
              className="bg-pic-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-pic-primary/90 transition"
            >
              랭킹 보기
            </button>
            <button
              onClick={handleGoToTimeAttack}
              className="bg-white text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              다시 도전하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeAttackResult: React.FC = () => {
  const location = useLocation() as LocationState;
  const navigate = useNavigate();

  // Zustand 상태 사용
  const result = useTimeAttackStore((state) => state.result);

  const [localResult, setLocalResult] = useState<TimeAttackResultData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRanking, setCurrentRanking] = useState<number | null>(null);
  const [noMatch, setNoMatch] = useState<boolean>(false); // 일치 항목 없음 상태

  // 애니메이션 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalDestination, setModalDestination] = useState<
    "ranking" | "timeattack"
  >("ranking");
  const [isSaving, setIsSaving] = useState(false);

  // 업적 관련 상태
  const [achievementMessage, setAchievementMessage] = useState<string | null>(
    null
  );
  const [showAchievementModal, setShowAchievementModal] =
    useState<boolean>(false);

  // 컴포넌트 마운트 시 데이터 설정
  useEffect(() => {
    console.log("분석 결과 데이터:", location.state?.result);
    console.log("Zustand 결과 데이터:", result);

    // 결과 데이터 설정
    if (location.state?.result) {
      setLocalResult(location.state.result);

      // 일치 항목 없음 직접 확인
      if (location.state.result?.message?.includes("일치 항목 없음")) {
        console.log("일치 항목 없음 감지됨 (location state)");
        setNoMatch(true);
      }

      // 실패 상태 확인
      if (location.state.result.success === false) {
        console.log("타임어택 실패 감지됨");
        // 이미 noMatch가 true면 두번째 확인은 건너뛼
        if (!noMatch) {
          setNoMatch(true);
        }
      }
    } else if (result) {
      // Zustand 상태에서 결과 가져오기
      setLocalResult({
        score: result.score,
        topicAccuracy: result.topicAccuracy,
        analysisData: result.analysisData,
        image: result.image,
        topic: result.topic,
        ranking: result.ranking,
        imageName: `timeattack_${Date.now()}.jpg`,
        success: result.score > 0,
      });

      // 피드백에서 일치 항목 없음 확인
      if (
        result.feedback &&
        Array.isArray(result.feedback) &&
        result.feedback.some(
          (item) => typeof item === "string" && item.includes("일치 항목 없음")
        )
      ) {
        console.log("일치 항목 없음 감지됨 (zustand)");
        setNoMatch(true);
      }
    }

    setIsLoading(false);
  }, [location, result]);

  // 다시 도전하기 핸들러 - 사용하지 않음 (SuccessResult에서 직접 처리)
  const handleTryAgain = () => {
    // 이전: 모달을 통해 경험치 표시 후 이동
    // setModalDestination("timeattack");
    // setShowModal(true);
    // 수정: 사용하지 않음 (SuccessResult에서 직접 navigate 처리)
  };

  // 타임어택 결과를 저장하고 업적을 확인하는 함수
  const saveResultAndCheckAchievement = async () => {
    try {
      setIsSaving(true);

      if (!localResult) return;

      // 1. 타임어택 결과 저장 API 호출
      await timeAttackApi.saveTimeAttackResult({
        imageName: localResult.imageName || `timeattack_${Date.now()}.jpg`,
        topic: localResult.topic || "",
        score: localResult.score || 0,
      });

      // 2. 업적 API 호출 (점수가 90점 이상인 경우만)
      if (localResult.score && localResult.score >= 90) {
        try {
          const achievementResponse =
            await achievementApi.submitTimeAttackScore(localResult.score);

          console.log("업적 API 응답:", achievementResponse);

          // 새로 달성한 경우에만 메시지 표시 (API 응답 메시지 확인)
          // "타임 어택 점수 뱃지 달성" - 새로 달성한 경우
          // "타임 어택 점수 뱃지 이미 달성" - 이미 달성한 경우
          if (
            achievementResponse.message &&
            achievementResponse.message.includes("달성") &&
            !achievementResponse.message.includes("이미")
          ) {
            setAchievementMessage(
              "🎉 축하합니다! '첫 타임어택 90점' 업적을 달성했습니다!"
            );
            setShowAchievementModal(true);
          }
        } catch (error) {
          console.error("업적 확인 중 오류 발생:", error);
        }
      }

      // 애니메이션 모달 표시 (저장 성공 후)
      setModalDestination("ranking");
      setShowModal(true);
    } catch (error) {
      console.error("결과 저장 실패:", error);
      // 오류 처리
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewRanking = async () => {
    await saveResultAndCheckAchievement();
  };

  // 애니메이션 모달에서 랭킹 보기 클릭 시 타임어택 랭킹 탭으로 이동하도록 설정
  const handleGoToRanking = () => {
    navigate("/ranking?tab=timeAttack", { replace: true });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 업적 알림 모달 컴포넌트
  const AchievementModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-sm mx-auto animate-fadeIn">
        <div className="mb-4 flex justify-center"></div>
        <h2 className="text-2xl font-bold mb-4 text-white">업적 달성!</h2>
        <p className="text-xl text-yellow-300 mb-6">{achievementMessage}</p>
        <button
          onClick={() => setShowAchievementModal(false)}
          className="mt-4 bg-pic-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-pic-primary/90 transition"
        >
          확인
        </button>
      </div>
    </div>
  );

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <Container>
        <LoadingState />
      </Container>
    );
  }

  // 결과 화면
  return (
    <Container>
      {/* 일치 항목 없거나 실패했을 때는 실패 화면 표시 */}
      {noMatch || (localResult && localResult.success === false) ? (
        <FailureResult
          message={
            localResult?.message ||
            `주제 "${
              localResult?.translatedTopic || localResult?.topic || "알 수 없음"
            }"에 맞는 항목을 찾지 못했습니다.`
          }
          topic={
            localResult?.topic ||
            useTimeAttackStore.getState().gameState.challengeTopic ||
            "알 수 없음"
          }
          translatedTopic={
            localResult?.translatedTopic ||
            translateTopic(
              useTimeAttackStore.getState().gameState.challengeTopic || ""
            )
          }
          image={localResult?.image} // 이미지 전달
        />
      ) : (
        <>
          <main className="flex-1 p-3">
            {localResult?.score !== undefined &&
              localResult?.topicAccuracy !== undefined &&
              localResult?.analysisData && (
                <SuccessResult
                  score={localResult.score}
                  topicAccuracy={localResult.topicAccuracy}
                  analysisData={localResult.analysisData}
                  image={localResult.image || null}
                  topic={localResult.topic || ""}
                  translatedTopic={localResult.translatedTopic}
                  imageName={
                    localResult.imageName || `timeattack_${Date.now()}.jpg`
                  }
                  ranking={currentRanking || localResult.ranking || 0}
                  onTryAgain={handleTryAgain}
                  onViewRanking={handleViewRanking}
                  isSaving={isSaving}
                />
              )}
          </main>
          <BottomBar />
        </>
      )}

      {/* 애니메이션 모달 */}
      <AnimationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        score={localResult?.score || 0}
        xpGained={Math.floor((localResult?.score || 0) * 10)} // XP 계산 로직: 점수 * 10
        destination={modalDestination}
      />

      {/* 업적 알림 모달 */}
      {showAchievementModal && <AchievementModal />}
    </Container>
  );
};

export default TimeAttackResult;
