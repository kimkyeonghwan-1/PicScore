import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { testApi } from "../../api/api";
import Button from "../../components/Button";

// 컨테스트 참가작 타입 정의
interface ContestEntry {
  id: number;
  userId: string;
  userNickname: string;
  imageUrl: string;
  title: string;
  description: string;
  likes: number;
  rating: number;
  timestamp: string;
  isLiked?: boolean;
}

// 컨테스트 주제 타입 정의
interface ContestTheme {
  id: number;
  theme: string;
  startDate: string;
  endDate: string;
  status: "ongoing" | "completed" | "upcoming";
}

// 이전 컨테스트 우승자 타입 정의
interface PreviousContest {
  id: number;
  theme: string;
  date: string;
  winnerNickname: string;
  winnerImageUrl: string;
}

function Contest() {
  const navigate = useNavigate();
  
  // 상태 관리
  const [currentTheme, setCurrentTheme] = useState<ContestTheme>({
    id: 1,
    theme: "자연의 아름다움",
    startDate: "2025-04-01",
    endDate: "2025-04-07",
    status: "ongoing",
  });
  const [daysLeft, setDaysLeft] = useState<number>(5);
  const [entries, setEntries] = useState<ContestEntry[]>([
    {
      id: 1,
      userId: "user1",
      userNickname: "사진작가123",
      imageUrl: "https://picsum.photos/400/300?random=1",
      title: "산 속의 아침 풍경",
      description: "해돋이 순간의 아름다운 산 풍경을 담았습니다.",
      likes: 24,
      rating: 4.7,
      timestamp: "2025-04-03",
      isLiked: false,
    },
    {
      id: 2,
      userId: "user2",
      userNickname: "풍경사진가",
      imageUrl: "https://picsum.photos/400/300?random=2",
      title: "바다의 일몰",
      description: "저녁 노을이 비치는 평화로운 해변 풍경입니다.",
      likes: 18,
      rating: 4.5,
      timestamp: "2025-04-04",
      isLiked: false,
    },
    {
      id: 3,
      userId: "user3",
      userNickname: "naturelover",
      imageUrl: "https://picsum.photos/400/300?random=3",
      title: "푸른 호수 반영",
      description: "고요한 호수에 반영된 산과 나무의 모습",
      likes: 31,
      rating: 4.9,
      timestamp: "2025-04-02",
      isLiked: true,
    },
  ]);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });
  const [sortOption, setSortOption] = useState<"rating" | "likes" | "newest">("rating");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previousContests, setPreviousContests] = useState<PreviousContest[]>([
    {
      id: 1,
      theme: "도시의 밤",
      date: "2025년 3월 4주",
      winnerNickname: "도시사진가",
      winnerImageUrl: "https://picsum.photos/200/200?random=10",
    },
    {
      id: 2,
      theme: "봄의 시작",
      date: "2025년 3월 3주",
      winnerNickname: "꽃사진작가",
      winnerImageUrl: "https://picsum.photos/200/200?random=11",
    },
    {
      id: 3,
      theme: "반려동물",
      date: "2025년 3월 2주",
      winnerNickname: "동물친구",
      winnerImageUrl: "https://picsum.photos/200/200?random=12",
    },
  ]);

  // 참가작 정렬
  const sortedEntries = [...entries].sort((a, b) => {
    if (sortOption === "rating") return b.rating - a.rating;
    if (sortOption === "likes") return b.likes - a.likes;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 남은 일수 계산
  useEffect(() => {
    if (currentTheme) {
      const endDate = new Date(currentTheme.endDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    }
  }, [currentTheme]);

  // 좋아요 기능
  const handleLike = (id: number) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              likes: entry.isLiked ? entry.likes - 1 : entry.likes + 1,
              isLiked: !entry.isLiked,
            }
          : entry
      )
    );
    
    // 실제 API 호출 구현 (백엔드 개발 후)
    // try {
    //   await testApi.post(`/api/v1/contest/entry/${id}/like`);
    // } catch (error) {
    //   console.error("좋아요 처리 오류:", error);
    // }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEntry({
        ...newEntry,
        file: e.target.files[0],
      });
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    // 유효성 검사
    if (!newEntry.title.trim()) {
      setUploadError("제목을 입력해주세요");
      setIsUploading(false);
      return;
    }

    if (!newEntry.description.trim()) {
      setUploadError("설명을 입력해주세요");
      setIsUploading(false);
      return;
    }

    if (!newEntry.file) {
      setUploadError("이미지를 선택해주세요");
      setIsUploading(false);
      return;
    }

    // 실제 API 제출 로직 (백엔드 개발 완료 후 주석 해제)
    // try {
    //   const formData = new FormData();
    //   formData.append("title", newEntry.title);
    //   formData.append("description", newEntry.description);
    //   formData.append("image", newEntry.file);
    //   formData.append("contestThemeId", currentTheme.id.toString());
    
    //   const response = await testApi.post("/api/v1/contest/entry", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });
    
    //   if (response.status === 201) {
    //     // 성공 시 처리
    //     const newEntryData = response.data.data;
    //     setEntries([newEntryData, ...entries]);
    //     setHasSubmitted(true);
    //     setShowUploadModal(false);
    //     setNewEntry({
    //       title: "",
    //       description: "",
    //       file: null,
    //     });
    //   }
    // } catch (error) {
    //   console.error("업로드 오류:", error);
    //   setUploadError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    // }
    
    // 임시 처리 (백엔드 개발 전)
    setTimeout(() => {
      const mockEntry: ContestEntry = {
        id: entries.length + 1,
        userId: "currentUser",
        userNickname: "나의닉네임",
        imageUrl: URL.createObjectURL(newEntry.file as Blob),
        title: newEntry.title,
        description: newEntry.description,
        likes: 0,
        rating: 0,
        timestamp: new Date().toISOString().split("T")[0],
        isLiked: false,
      };
      
      setEntries([mockEntry, ...entries]);
      setHasSubmitted(true);
      setShowUploadModal(false);
      setNewEntry({
        title: "",
        description: "",
        file: null,
      });
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-gray-50 min-h-screen pb-16">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-center">주간 사진 컨테스트</h1>
      </div>

      {/* 현재 컨테스트 정보 */}
      <div className="bg-pic-primary bg-opacity-10 p-4 border-b border-pic-primary border-opacity-20">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">이번 주 주제</h2>
          <span className="bg-pic-primary text-white text-xs px-2 py-1 rounded-full">
            D-{daysLeft}
          </span>
        </div>
        <p className="text-xl font-bold text-pic-primary mb-1">{currentTheme.theme}</p>
        <p className="text-sm text-gray-600">
          {currentTheme.startDate} ~ {currentTheme.endDate}
        </p>
      </div>

      {/* 참가 버튼 */}
      {!hasSubmitted && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-pic-primary text-white py-3 rounded-lg font-medium hover:bg-[#7cc948] active:bg-[#66a13e] transition-colors shadow-sm flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
            사진 업로드하기
          </button>
        </div>
      )}

      {/* 정렬 옵션 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-bold">참가 작품</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSortOption("rating")}
            className={`px-2 py-1 text-xs rounded-full ${
              sortOption === "rating"
                ? "bg-pic-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            평점순
          </button>
          <button
            onClick={() => setSortOption("likes")}
            className={`px-2 py-1 text-xs rounded-full ${
              sortOption === "likes"
                ? "bg-pic-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            좋아요순
          </button>
          <button
            onClick={() => setSortOption("newest")}
            className={`px-2 py-1 text-xs rounded-full ${
              sortOption === "newest"
                ? "bg-pic-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      {/* 참가 작품 목록 */}
      <div className="divide-y divide-gray-200">
        {sortedEntries.length > 0 ? (
          sortedEntries.map((entry) => (
            <div key={entry.id} className="p-4 bg-white">
              <div className="flex items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                  <img
                    src={`https://picsum.photos/50/50?random=${entry.id}`}
                    alt={entry.userNickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">{entry.userNickname}</h3>
                  <p className="text-xs text-gray-500">{entry.timestamp}</p>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">{entry.title}</h3>
              <p className="text-gray-700 text-sm mb-3">{entry.description}</p>

              <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 max-h-80">
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => handleLike(entry.id)}
                    className={`flex items-center mr-4 ${
                      entry.isLiked ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={entry.isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{entry.likes}</span>
                  </button>
                </div>
                <div className="flex items-center text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(entry.rating) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                  <span className="text-gray-700 ml-1">{entry.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            아직 참가 작품이 없습니다. 첫 번째 참가자가 되어보세요!
          </div>
        )}
      </div>

      {/* 이전 컨테스트 */}
      <div className="p-4 mt-4">
        <h2 className="font-bold mb-3">이전 컨테스트 우승자</h2>
        <div className="space-y-3">
          {previousContests.map((contest) => (
            <div
              key={contest.id}
              className="flex items-center bg-white p-3 rounded-lg shadow-sm"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img
                  src={contest.winnerImageUrl}
                  alt={contest.winnerNickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">{contest.date}</p>
                <h3 className="font-bold">테마: {contest.theme}</h3>
                <p className="text-xs">
                  우승자: <span className="font-semibold">{contest.winnerNickname}</span>
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gold"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"></path>
                <path d="M15 7a4 4 0 1 0-8 0"></path>
                <path d="M17.5 17a6.5 6.5 0 1 0-13 0"></path>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* 사진 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5">
            <h2 className="text-xl font-bold mb-4">컨테스트 참가하기</h2>
            <p className="text-gray-600 mb-4">
              주제: <span className="font-semibold">{currentTheme.theme}</span>
            </p>

            <form onSubmit={handleSubmit}>
              {/* 제목 입력 */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pic-primary"
                  maxLength={50}
                  placeholder="작품 제목을 입력하세요 (최대 50자)"
                />
              </div>

              {/* 설명 입력 */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pic-primary"
                  rows={3}
                  maxLength={200}
                  placeholder="작품에 대한 설명을 입력하세요 (최대 200자)"
                ></textarea>
              </div>

              {/* 오류 메시지 */}
              {uploadError && (
                <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded-md">
                  {uploadError}
                </div>
              )}

              {/* 이미지 업로드 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 업로드
                </label>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                  {newEntry.file ? (
                    <div className="relative w-full max-h-60 overflow-hidden">
                      <img
                        src={URL.createObjectURL(newEntry.file)}
                        alt="미리보기"
                        className="mx-auto max-h-60 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setNewEntry({ ...newEntry, file: null })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto text-gray-400 mb-2"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                        <circle cx="12" cy="13" r="3"></circle>
                      </svg>
                      <p className="text-sm text-gray-500 mb-2">
                        이미지를 클릭하거나 드래그하여 업로드하세요
                      </p>
                      <input
                        type="file"
                        id="image"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("image")?.click()}
                        className="px-3 py-1 bg-pic-primary text-white text-sm rounded-md hover:bg-[#7cc948]"
                      >
                        이미지 선택
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG 파일만 허용됩니다. 최대 파일 크기: 5MB
                </p>
              </div>

              {/* 버튼 영역 */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`flex-1 py-2 px-4 bg-pic-primary text-white rounded-md hover:bg-[#7cc948] transition-colors
                    ${isUploading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-r-transparent rounded-full mr-2"></div>
                      업로드 중...
                    </div>
                  ) : (
                    "참가하기"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contest;