// page/Arena/components/GameStep.tsx
import React from "react";
import { ArenaPhoto } from "../../../api/arenaApi";

interface GameStepProps {
  timeLeft: number;
  photos: ArenaPhoto[];
  userOrder: number[];
  onPhotoSelect: (photoId: number) => void;
  onRemoveSelection: (index: number) => void;
  onSubmit: () => void;
  isComplete: boolean;
}

const GameStep: React.FC<GameStepProps> = ({
  timeLeft,
  photos,
  userOrder,
  onPhotoSelect,
  onRemoveSelection,
  onSubmit,
  isComplete,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-4">
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* 남은 시간 표시 */}
        <div className="mb-3 w-full">
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

        {/* 안내 메시지 */}
        <div className="bg-white p-3 rounded-lg shadow-sm mb-3 border border-gray-200 w-full">
          <div className="bg-yellow-50 p-2 rounded-lg text-center font-medium flex items-center justify-center h-14 border border-yellow-200 text-yellow-700">
            사진의 <span className="font-bold mx-1">점수 순서</span>를 높은 순서부터 맞춰주세요!
          </div>
        </div>

        {/* 사진 선택 영역 */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-3 border border-gray-200 w-full">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                  userOrder.includes(photo.id)
                    ? "opacity-40 border-gray-300 hover:border-red-500"
                    : "border-transparent hover:border-pic-primary"
                }`}
                onClick={() => onPhotoSelect(photo.id)}
              >
                <img
                  src={photo.imageUrl}
                  alt="Challenge photo"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* 선택한 순서 표시 영역 */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-gray-700 font-medium mb-2">
              선택한 순서 (점수 높은순)
            </h3>
            <div className="flex justify-between gap-2">
              {Array(4)
                .fill(0)
                .map((_, index) => {
                  const photoId = userOrder[index];
                  const photo =
                    photoId !== undefined
                      ? photos.find((p) => p.id === photoId)
                      : null;

                  return (
                    <div
                      key={index}
                      className={`relative w-1/4 aspect-square rounded-lg ${
                        photo
                          ? "bg-cover shadow-sm"
                          : "bg-gray-100 border border-dashed border-gray-300"
                      }`}
                      style={
                        photo ? { backgroundImage: `url(${photo.imageUrl})` } : {}
                      }
                    >
                      {photo && (
                        <>
                          <div className="absolute top-0 left-0 w-6 h-6 bg-pic-primary text-white rounded-tl-lg rounded-br-lg flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <button
                            className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-tr-lg rounded-bl-lg flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSelection(index);
                            }}
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={onSubmit}
          disabled={!isComplete}
          className={`w-full py-3 rounded-lg font-bold text-lg ${
            isComplete
              ? "bg-pic-primary text-white"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          {isComplete ? "정답 제출하기" : "4장의 사진을 모두 선택하세요"}
        </button>
      </div>
    </div>
  );
};

export default GameStep;
