// // page/Arena/components/ArenaResult.tsx
// import React from "react";
// import { ArenaPhoto } from "../../../api/arenaApi";

// interface ArenaResultProps {
//   score: number;
//   userOrder: number[];
//   correctOrder: number[];
//   photos: ArenaPhoto[];
//   timeSpent: number;
//   correctCount: number;
//   xpEarned: number;
//   onPlayAgain: () => void;
//   onViewRanking: () => void;
//   isSaving: boolean;
// }

// const ArenaResult: React.FC<ArenaResultProps> = ({
//   score,
//   userOrder,
//   correctOrder,
//   photos,
//   timeSpent,
//   correctCount,
//   xpEarned,
//   onPlayAgain,
//   onViewRanking,
//   isSaving,
// }) => {
//   const isAllCorrect = correctCount === 4;

//   // 정렬된 사진 배열 가져오기
//   const getSortedPhotos = () => {
//     return [...photos].sort((a, b) => b.score - a.score);
//   };

//   // 사용자가 선택한 순서대로 사진 가져오기
//   const getUserOrderedPhotos = () => {
//     return userOrder.map(id => photos.find(photo => photo.id === id));
//   };

//   return (
//     <div className="p-4">
//       {/* 결과 요약 카드 */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//         <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
//           {isAllCorrect ? "축하합니다! 🎉" : "좋은 시도였습니다! 👍"}
//         </h2>
//         <p className="text-center text-gray-600 mb-6">
//           {isAllCorrect
//             ? "모든 사진 순서를 정확히 맞추셨습니다!"
//             : `4개 중 ${correctCount}개의 사진 순서를 맞추셨습니다.`}
//         </p>

//         <div className="flex justify-between items-center mb-4">
//           <span className="text-gray-700 font-medium">획득 점수</span>
//           <span className="text-2xl font-bold text-pic-primary">{score}</span>
//         </div>

//         <div className="flex justify-between items-center mb-4">
//           <span className="text-gray-700 font-medium">소요 시간</span>
//           <span className="font-semibold">
//             {timeSpent === 30 ? "30초 초과" : `${30 - timeSpent}초`}
//           </span>
//         </div>

//         <div className="flex justify-between items-center mb-2">
//           <span className="text-gray-700 font-medium">획득 경험치</span>
//           <span className="text-xl font-bold text-green-600">+{xpEarned} XP</span>
//         </div>
//       </div>

//       {/* 정답 비교 섹션 */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//         <h3 className="text-lg font-semibold mb-4 text-gray-800">정답 확인</h3>

//         <div className="mb-6">
//           <h4 className="text-base font-medium text-gray-700 mb-2">정답 순서 (점수 높은순)</h4>
//           <div className="grid grid-cols-4 gap-2">
//             {getSortedPhotos().map((photo, index) => (
//               <div key={`correct-${photo.id}`} className="relative">
//                 <div className="aspect-square rounded-lg overflow-hidden">
//                   <img
//                     src={photo.imageUrl}
//                     alt={`Rank ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute top-0 left-0 w-6 h-6 bg-pic-primary text-white rounded-tl-lg rounded-br-lg flex items-center justify-center font-bold">
//                   {index + 1}
//                 </div>
//                 <div className="text-center mt-1 text-sm font-medium">
//                   {photo.score}점
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div>
//           <h4 className="text-base font-medium text-gray-700 mb-2">내가 선택한 순서</h4>
//           <div className="grid grid-cols-4 gap-2">
//             {getUserOrderedPhotos().map((photo, index) => {
//               if (!photo) return null;
//               const correctIndex = getSortedPhotos().findIndex(p => p.id === photo.id);
//               const isCorrect = correctIndex === index;

//               return (
//                 <div key={`user-${photo.id}`} className="relative">
//                   <div className={`aspect-square rounded-lg overflow-hidden ${isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500'}`}>
//                     <img
//                       src={photo.imageUrl}
//                       alt={`Your Rank ${index + 1}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <div className="absolute top-0 left-0 w-6 h-6 bg-pic-primary text-white rounded-tl-lg rounded-br-lg flex items-center justify-center font-bold">
//                     {index + 1}
//                   </div>
//                   <div className={`absolute top-0 right-0 w-6 h-6 ${isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white rounded-tr-lg rounded-bl-lg flex items-center justify-center`}>
//                     {isCorrect ? '✓' : '✗'}
//                   </div>
//                   <div className="text-center mt-1 text-sm font-medium">
//                     {photo.score}점
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* 버튼 영역 */}
//       <div className="flex space-x-3">
//         <button
//           onClick={onPlayAgain}
//           className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
//         >
//           다시 도전하기
//         </button>
//         <button
//           onClick={onViewRanking}
//           disabled={isSaving}
//           className={`flex-1 bg-pic-primary text-white py-3 rounded-lg font-medium ${
//             isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-pic-primary/90"
//           } transition-colors flex justify-center items-center`}
//         >
//           {isSaving ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               저장 중...
//             </>
//           ) : (
//             "랭킹 보기"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ArenaResult;
