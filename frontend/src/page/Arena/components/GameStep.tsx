// // page/Arena/components/GameStep.tsx
// import React from "react";
// import { ArenaPhoto } from "../../../api/arenaApi";

// interface GameStepProps {
//   timeLeft: number;
//   photos: ArenaPhoto[];
//   userOrder: number[];
//   onPhotoSelect: (photoId: number) => void;
//   onRemoveSelection: (index: number) => void;
//   onSubmit: () => void;
//   isComplete: boolean;
// }

// const GameStep: React.FC<GameStepProps> = ({
//   timeLeft,
//   photos,
//   userOrder,
//   onPhotoSelect,
//   onRemoveSelection,
//   onSubmit,
//   isComplete,
// }) => {
//   return (
//     <div className="flex flex-col p-4">
//       {/* 타이머 */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold text-gray-800">사진 점수 맞추기</h2>
//         <div className="bg-pic-primary/90 text-white py-1 px-4 rounded-full text-lg font-medium">
//           {timeLeft}초
//         </div>
//       </div>

//       {/* 안내 메시지 */}
//       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
//         <p className="text-yellow-700 text-sm">
//           사진의 <span className="font-bold">점수 순서</span>를 높은 순서부터 맞춰주세요!
//         </p>
//       </div>

//       {/* 사진 선택 영역 */}
//       <div className="flex flex-wrap gap-4 justify-center mb-6">
//         {photos.map((photo) => (
//           <div
//             key={photo.id}
//             className={`relative w-[calc(50%-0.5rem)] aspect-square overflow-hidden rounded-lg shadow-md border-2 transition-all ${
//               userOrder.includes(photo.id)
//                 ? "opacity-40 border-gray-300"
//                 : "border-transparent hover:border-pic-primary cursor-pointer"
//             }`}
//             onClick={() => !userOrder.includes(photo.id) && onPhotoSelect(photo.id)}
//           >
//             <img
//               src={photo.imageUrl}
//               alt="Challenge photo"
//               className="w-full h-full object-cover"
//             />
//           </div>
//         ))}
//       </div>

//       {/* 선택한 순서 표시 영역 */}
//       <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">선택한 순서 (점수 높은순)</h3>
//         <div className="flex justify-between gap-2">
//           {Array(4)
//             .fill(0)
//             .map((_, index) => {
//               const photoId = userOrder[index];
//               const photo = photoId !== undefined ? photos.find(p => p.id === photoId) : null;

//               return (
//                 <div
//                   key={index}
//                   className={`relative w-1/4 aspect-square rounded-lg ${
//                     photo
//                       ? "bg-cover shadow-md"
//                       : "bg-gray-100 border border-dashed border-gray-300"
//                   }`}
//                   style={photo ? {backgroundImage: `url(${photo.imageUrl})`} : {}}
//                 >
//                   {photo && (
//                     <>
//                       <div className="absolute top-0 left-0 w-6 h-6 bg-pic-primary text-white rounded-tl-lg rounded-br-lg flex items-center justify-center font-bold">
//                         {index + 1}
//                       </div>
//                       <button
//                         className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-tr-lg rounded-bl-lg flex items-center justify-center"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemoveSelection(index);
//                         }}
//                       >
//                         ×
//                       </button>
//                     </>
//                   )}
//                 </div>
//               );
//             })}
//         </div>
//       </div>

//       {/* 제출 버튼 */}
//       <div className="mt-auto">
//         <button
//           onClick={onSubmit}
//           disabled={!isComplete}
//           className={`w-full py-3 rounded-lg font-semibold text-lg ${
//             isComplete
//               ? "bg-pic-primary text-white"
//               : "bg-gray-200 text-gray-500 cursor-not-allowed"
//           }`}
//         >
//           {isComplete ? "정답 제출하기" : "4장의 사진을 모두 선택하세요"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameStep;
