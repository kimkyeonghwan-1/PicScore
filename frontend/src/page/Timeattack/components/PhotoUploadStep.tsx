// page/Timeattack/components/PhotoUploadStep.tsx
import React from "react";

interface PhotoUploadStepProps {
  timeLeft: number;
  challengeTopic: string;
  translatedTopic: string; // 한글로 번역된 주제 추가
  selectedImage: string | null;
  isLoading: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageSubmit: () => void;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({
  timeLeft,
  challengeTopic,
  translatedTopic, // 한글 주제 추가
  selectedImage,
  isLoading,
  onImageUpload,
  onImageSubmit,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-6">
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* 상단의 남은 시간 (첫 번째 행) */}
        <div className="mb-1 w-full">
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="text-center text-gray-600 text-sm mb-1">
              남은 시간
            </div>
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pic-primary to-pic-primary/80 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {timeLeft}
              </div>
            </div>
          </div>
        </div>

        {/* 주제 (두 번째 행) */}
        <div className="mb-1 w-full">
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="text-center text-gray-600 text-sm mb-1">주제</div>
            <div className="bg-gray-50 p-2 rounded-lg text-center text-lg font-bold flex items-center justify-center h-14 border border-pic-primary/20 text-pic-primary">
              {translatedTopic} {/* 한글 주제 사용 */}
            </div>
          </div>
        </div>

        {/* 사진 업로드 영역 */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-2 border border-gray-100 w-full">
          <div className="border-2 border-dashed border-pic-primary/30 rounded-lg flex flex-col items-center justify-center p-2 aspect-[4/3]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary mb-3"></div>
                <p className="text-gray-500">이미지 처리 중...</p>
              </div>
            ) : selectedImage ? (
              <img
                src={selectedImage}
                alt="촬영된 사진"
                className="max-h-full object-contain rounded"
              />
            ) : (
              <>
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <div className="text-pic-primary mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-center font-medium">
                    모바일 카메라로 사진을 촬영하세요
                  </p>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    주제 "{translatedTopic}"에 맞는 사진을 찍어보세요!
                  </p>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    (타임어택은 모바일 기기의 카메라로만 가능합니다)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={onImageUpload}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* 버튼 */}
        {selectedImage ? (
          <button
            onClick={onImageSubmit}
            disabled={isLoading}
            className={`bg-pic-primary text-white py-3 rounded-lg text-lg font-bold hover:bg-pic-primary/90 transition shadow-sm w-full ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "분석 중..." : "제출하기"}
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-300 text-white py-3 rounded-lg text-lg font-bold shadow-sm w-full"
          >
            사진 선택 후 제출 가능
          </button>
        )}

        {/* 타임어택 팁 섹션 */}
        <div className="bg-gray-50 rounded-lg shadow-md p-3 mt-2 border border-gray-100 w-full">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            타임어택 팁
          </h3>
          <ul className="text-xs text-gray-500">
            <li className="flex items-start mb-1">
              <span className="text-pic-primary mr-1">•</span>
              <span>주제와 관련성이 높을수록 높은 점수를 받을 수 있어요!</span>
            </li>
            <li className="flex items-start mb-1">
              <span className="text-pic-primary mr-1">•</span>
              <span>남은 시간이 많을수록 추가 보너스가 있어요.</span>
            </li>
            <li className="flex items-start">
              <span className="text-pic-primary mr-1">•</span>
              <span>좀 더 창의적인 구도와 조명을 사용해보세요!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadStep;
