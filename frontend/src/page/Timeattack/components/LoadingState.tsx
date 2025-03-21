import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col max-w-md mx-auto min-h-screen bg-gray-50 items-center justify-center border-x border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      <p className="mt-4 text-gray-600">결과를 불러오는 중...</p>
    </div>
  );
};

export default LoadingState;
