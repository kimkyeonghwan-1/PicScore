// page/Arena/components/ExplanationStep.tsx
import React from "react";

interface ExplanationStepProps {
  onStartGame: () => void;
}

const ExplanationStep: React.FC<ExplanationStepProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-20 h-20 mb-6 mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-full h-full text-pic-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        사진 점수 맞추기 아레나
      </h1>

      <div className="bg-white p-5 rounded-xl shadow-md max-w-md mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-pic-primary mb-2">
            게임 방법
          </h2>
          <ul className="list-disc list-inside text-left text-gray-700 space-y-2">
            <li>게시판에서 무작위로 선택된 4장의 사진이 표시됩니다.</li>
            <li>
              사진들의 <span className="font-bold">점수 순서</span>를 높은
              순서부터 맞춰보세요!
            </li>
            <li>30초의 제한 시간 내에 정답을 맞춰야 합니다.</li>
            <li>정답을 맞출수록 더 많은 점수와 경험치를 획득할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-pic-primary mb-2">
            점수 계산
          </h2>
          <ul className="list-disc list-inside text-left text-gray-700 space-y-2">
            <li>모든 순서를 맞추면: 100점 + 남은 시간(초) × 10점</li>
            <li>일부 순서를 맞추면: 맞춘 개수 × 25점</li>
            <li>획득 경험치: 점수 × 1.2</li>
          </ul>
        </div>
      </div>

      <button
        onClick={onStartGame}
        className="bg-pic-primary hover:bg-pic-primary/90 text-white font-semibold py-3 px-8 rounded-lg transform transition-transform duration-300 hover:scale-105 shadow-lg"
      >
        게임 시작하기
      </button>
    </div>
  );
};

export default ExplanationStep;
