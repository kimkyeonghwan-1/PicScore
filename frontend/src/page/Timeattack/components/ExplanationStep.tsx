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
            타임어택 게임 방법
          </h2>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                1
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">게임시작을 누르면 3초 뒤</p>
                <p className="text-gray-600">주제가 주어집니다.</p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                2
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">주제를 확인하고 20초 내에</p>
                <p className="text-gray-600">
                  카메라로 주제에 맞는 사진을 촬영하세요!
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pic-primary text-white font-bold text-xl">
                3
              </div>
              <div className="ml-4 flex-1">
                <p className="font-bold">정확도 및 사진점수에 따라</p>
                <p className="text-gray-600">보상이 주어집니다.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-pic-primary font-bold mb-2">TIP!</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>게임 시작 전 주변 환경을 미리 둘러보세요</span>
              </li>
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>시간이 넉넉하지 않으니 빠르게 촬영하세요</span>
              </li>
              <li className="flex items-start">
                <span className="text-pic-primary mr-2">•</span>
                <span>주제와 연관성이 높을수록 높은 점수를 받을 수 있어요</span>
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
