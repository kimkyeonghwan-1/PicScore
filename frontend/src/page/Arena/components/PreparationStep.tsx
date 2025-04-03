// page/Arena/components/PreparationStep.tsx
import React from "react";

interface PreparationStepProps {
  countdown: number;
}

const PreparationStep: React.FC<PreparationStepProps> = ({ countdown }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center bg-gradient-to-b from-blue-50 via-white to-white">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        준비하세요!
      </h2>
      <p className="text-lg text-gray-500 mb-8">곧 사진이 공개됩니다</p>

      <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-r bg-pic-primary mb-12 shadow-lg">
        <span className="text-white text-7xl font-semibold">{countdown}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 w-full border border-gray-200">
        <div className="flex">
          <div className="mr-3 text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-yellow-500 font-bold mb-1">주의!</h3>
            <p className="text-gray-700">
              공개된 사진들의 점수 순서를 높은 순서부터 선택해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationStep;
