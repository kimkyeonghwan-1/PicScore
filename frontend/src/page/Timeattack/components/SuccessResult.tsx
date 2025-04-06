// page/Timeattack/components/SuccessResult.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SaveWarning from "./SaveWarning";

interface AnalysisData {
  composition: number;
  lighting: number;
  subject: number;
  color: number;
  creativity: number;
}

interface SuccessResultProps {
  score: number;
  topicAccuracy: number;
  analysisData: AnalysisData;
  image: string | null;
  topic: string;
  translatedTopic?: string;
  imageName: string;
  ranking: number;
  onTryAgain?: () => void;
  onViewRanking?: () => void;
  onShowXpModal?: () => void;
  isSaving?: boolean;
  xpEarned?: number;
}

const SuccessResult: React.FC<SuccessResultProps> = ({
  score,
  topicAccuracy,
  analysisData,
  image,
  topic,
  translatedTopic,
  imageName,
  ranking,
  onTryAgain,
  onViewRanking,
  onShowXpModal,
  isSaving = false,
  xpEarned = 0,
}) => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain();
    } else {
      // 경험치 반환 없이 바로 타임어택 페이지로 이동
      sessionStorage.removeItem("timeAttackResultSaved");
      sessionStorage.removeItem("timeAttackXpSaved");
      navigate("/time-attack");
    }
  };

  const handleGoHome = () => {
    // 홈으로 이동
    navigate("/");
  };

  const handleViewRanking = () => {
    if (onViewRanking) {
      onViewRanking();
    } else {
      navigate("/ranking", { state: { from: "timeattack-result" } });
    }
  };

  const handleShowXpModal = () => {
    if (onShowXpModal) {
      onShowXpModal();
    }
  };

  // 분석 결과에서 피드백 생성
  const generateFeedback = () => {
    const feedbacks = [];

    // 주제 관련 피드백
    if (topicAccuracy >= 80) {
      feedbacks.push(
        `• 주제 "${translatedTopic || topic}"에 매우 적합한 사진입니다.`
      );
    } else if (topicAccuracy >= 50) {
      feedbacks.push(
        `• 주제 "${translatedTopic || topic}"와 관련성이 있습니다.`
      );
    } else {
      feedbacks.push(
        `• 주제 "${translatedTopic || topic}"와의 연관성이 낮습니다.`
      );
    }

    // 구도 피드백
    if (analysisData.composition >= 80) {
      feedbacks.push("• 구도가 잘 잡혀있어 시각적으로 매력적입니다.");
    } else if (analysisData.composition >= 60) {
      feedbacks.push("• 구도는 양호하지만 개선의 여지가 있습니다.");
    }

    // 조명 피드백
    if (analysisData.lighting >= 80) {
      feedbacks.push("• 조명이 적절하게 사용되었습니다.");
    } else if (analysisData.lighting >= 60) {
      feedbacks.push("• 조명이 조금 더 밝으면 좋을 것 같습니다.");
    }

    return feedbacks;
  };

  return (
    <div className="flex flex-col gap-3 pt-4">
      {/* 메인 결과 카드 */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-pic-primary/10 rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-pic-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-5">타임어택 성공!</h2>

        {/* 이미지 컨테이너 */}
        <div className="relative overflow-hidden rounded-lg mb-6 shadow-md">
          {image ? (
            <img
              src={image}
              alt="촬영된 사진"
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">이미지 없음</span>
            </div>
          )}
        </div>

        {/* 정확도와 점수 - 3열 그리드로 변경 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">주제</p>
            <p className="text-lg font-bold text-pic-primary">
              {translatedTopic || topic}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">연관도</p>
            <p className="text-lg font-bold text-pic-primary">
              {topicAccuracy}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">점수</p>
            <p className="text-lg font-bold text-pic-primary">{score}</p>
          </div>
        </div>

        {/* 경험치 표시 */}
        {xpEarned > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-6" onClick={handleShowXpModal}>
            <p className="text-green-700 text-sm mb-1">획득한 경험치</p>
            <p className="text-xl font-bold text-green-600">+{xpEarned} XP</p>
          </div>
        )}

        {/* 저장 경고 메시지 */}
        <SaveWarning />

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <button
            onClick={handleViewRanking}
            className="w-full bg-pic-primary text-white py-3.5 rounded-lg font-bold hover:bg-pic-primary/90 transition-colors duration-200 shadow-sm flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                저장 중...
              </div>
            ) : (
              <span>랭킹 등록</span>
            )}
          </button>

          {/* 버튼 두 개를 나란히 배치 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTryAgain}
              className="border border-pic-primary text-pic-primary bg-white py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors duration-200"
              disabled={isSaving}
            >
              다시 도전하기
            </button>

            <button
              onClick={handleGoHome}
              className="border border-gray-300 text-gray-700 bg-white py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors duration-200"
              disabled={isSaving}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessResult;
