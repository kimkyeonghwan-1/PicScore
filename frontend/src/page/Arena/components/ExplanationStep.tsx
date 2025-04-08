// page/Arena/components/ExplanationStep.tsx
import React from "react";

interface ExplanationStepProps {
  onStartGame: () => void;
}

const ExplanationStep: React.FC<ExplanationStepProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col flex-1 p-4 items-center justify-center">
      <div className="w-full max-w-sm mb-5">
        <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 mb-5">
          <h2 className="text-2xl font-bold mb-5 text-center text-pic-primary">
            아레나 게임 방법
          </h2>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                1
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">게임을 시작하면</p>
                <p className="text-gray-600">
                  게시판에서 무작위로 선택된 4장의 사진이 표시됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                2
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">20초 내에</p>
                <p className="text-gray-600">
                  사진들의 <span className="font-bold">점수 순서</span>를 높은
                  순서부터 맞춰보세요!
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                3
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">정답을 맞출수록</p>
                <p className="text-gray-600">
                  더 많은 점수와 경험치를 획득할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-pic-primary font-bold mb-2">TIP!</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>순서를 빨리 맞출수록 점수를 더 받을 수 있어요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>일부만 맞춰도 맞은 개수만큼 점수를 받을 수 있어요.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>AI감수성을 길러보세요..!</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onStartGame}
          className="w-full bg-pic-primary text-white py-3.5 rounded-lg text-lg font-bold hover:bg-pic-primary/90 transition shadow-sm"
        >
          게임 시작
        </button>
      </div>
    </div>
  );
};

export default ExplanationStep;
