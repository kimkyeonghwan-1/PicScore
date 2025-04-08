import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { testApi } from "../../api/api";
import Button from "../../components/Button";
import imageCompression from "browser-image-compression";
import { useInView } from "react-intersection-observer";

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
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });
  const [sortOption, setSortOption] = useState<"likes" | "newest">("likes");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // 무한스크롤 관련 상태
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // 시작시 처음 데이터 로드
  useEffect(() => {
    // 처음 데이터 로드
    loadMoreEntries();
  }, []);
  
  // Board 페이지의 useInView 사용하여 무한스크롤 구현
  const { ref: scrollRef, inView } = useInView({
    rootMargin: "0px 0px 400px 0px",  // 하단에서 400px 지점에 도달하면 추가 로드
    threshold: 0
  });

  // inView가 변할 때 추가 데이터 로드
  useEffect(() => {
    if (inView && hasMore && !loading) {
      console.log('추가 데이터 로드 중...');
      loadMoreEntries();
    }
  }, [inView, hasMore, loading]);

  // 추가 게시글 로드 함수
  const loadMoreEntries = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 테스트 데이터를 위한 임시 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 실제 API 호출
      // const response = await testApi.get(`/api/v1/contest/entries?page=${page}&size=5`);
      // const newEntries = response.data.data.content;
      // setHasMore(response.data.data.hasNext);
      
      // 테스트용 데이터 생성
      const newEntries: ContestEntry[] = Array.from({ length: 3 }, (_, i) => ({
        id: entries.length + i + 1,
        userId: `user${entries.length + i + 1}`,
        userNickname: `사용자${entries.length + i + 1}`,
        imageUrl: `https://picsum.photos/400/300?random=${entries.length + i + 10}`,
        title: `참가작 ${entries.length + i + 1}`,
        description: `무한스크롤로 로드된 참가작입니다. ${page} 페이지의 ${i + 1}번째 게시글`,
        likes: Math.floor(Math.random() * 20),
        rating: 0,
        timestamp: new Date().toISOString().split("T")[0],
        isLiked: false,
      }));
      
      setEntries(prev => [...prev, ...newEntries]);
      setPage(prev => prev + 1);
      
      // 테스트를 위해 5페이지 이후로는 더 이상 로드하지 않도록 설정
      if (page >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('게시글 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 이미지 압축 함수 - ImageEval 참고
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    // 파일 크기가 5MB 미만이면 압축하지 않음
    const FILE_SIZE_LIMIT = 5; // 5MB
    const TARGET_SIZE = 4; // 4MB
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB < FILE_SIZE_LIMIT) {
      console.log(`압축 불필요: 파일 크기 ${fileSizeMB.toFixed(2)}MB (5MB 미만)`);
      return file;
    }

    try {
      // 압축 옵션 설정
      const options = {
        maxSizeMB: TARGET_SIZE, // 최대 파일 크기 (MB)
        maxWidthOrHeight: 1920, // 최대 너비/높이 (픽셀) - 고해상도 유지
        useWebWorker: true, // WebWorker 사용 (성능 향상)
        initialQuality: 0.8, // 초기 품질
        alwaysKeepResolution: true, // 해상도 유지
      };

      console.log(`압축 시작: 원본 크기 ${fileSizeMB.toFixed(2)}MB (5MB 이상)`);

      // 이미지 압축 실행
      const compressedFile = await imageCompression(file, options);
      const compressedSizeMB = compressedFile.size / (1024 * 1024);

      console.log(
        `압축 완료: ${compressedSizeMB.toFixed(2)}MB (${Math.round(
          (compressedFile.size / file.size) * 100
        )}% 크기)`
      );

      return compressedFile;
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      // 압축 실패 시 원본 파일 반환
      return file;
    }
  };
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
    if (sortOption === "likes") return b.likes - a.likes;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 참가작 정렬 재실행
  useEffect(() => {
    // 정렬 옵션이 변경될 때 마다 정렬 적용
    const sorted = [...entries].sort((a, b) => {
      if (sortOption === "likes") return b.likes - a.likes;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // 정렬된 배열을 새로운 배열로 설정하지 않고 정렬만 처리
    setEntries(sorted);
  }, [sortOption]);
  
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

  // 파일 선택 핸들러 - ImageEval 참고
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const originalFile = e.target.files[0];
        
        // 파일 크기 확인 (100MB 제한)
        const fileSizeMB = originalFile.size / (1024 * 1024);
        const MAX_FILE_SIZE = 100; // 100MB 제한

        if (fileSizeMB > MAX_FILE_SIZE) {
          alert(
            `파일 크기가 너무 큽니다. (${fileSizeMB.toFixed(
              1
            )}MB)\n\n최대 ${MAX_FILE_SIZE}MB 크기의 이미지만 업로드 가능합니다.`
          );
          
          // 파일 선택 초기화
          if (e.target) e.target.value = "";
          return;
        }
        
        // 원본 이미지 미리보기 설정 (압축 전)
        setNewEntry({
          ...newEntry,
          file: originalFile,
        });
        
        console.log(`원본 이미지 크기: ${fileSizeMB.toFixed(2)}MB`);
      } catch (error) {
        console.error('파일 처리 오류:', error);
        setUploadError('파일 처리 중 오류가 발생했습니다.');
      }
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

    try {
      // 이미지 압축 적용 (필요한 경우에만 - 5MB 이상일 때)
      const processedFile = await compressImageIfNeeded(newEntry.file);
      
      // FormData 생성
      const formData = new FormData();
      formData.append("title", newEntry.title);
      formData.append("description", newEntry.description);
      formData.append("image", processedFile);
      formData.append("contestThemeId", currentTheme.id.toString());
      
      // 실제 API 호출 (백엔드 개발 완료 후 주석 해제)
      // try {
      //   const response = await testApi.post("/api/v1/contest/entry", formData, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   });
      //   
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
        // 새로운 게시글을 만들어 상단에 추가
        const mockEntry: ContestEntry = {
          id: Date.now(), // 유니크한 ID 생성
          userId: "currentUser",
          userNickname: "나의닉네임",
          imageUrl: URL.createObjectURL(processedFile), // 압축된 이미지 사용
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
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      setUploadError('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white min-h-screen pb-16">

      {/* 현재 컨테스트 정보 */}
      <div className="bg-gradient-to-r from-pic-primary/5 to-pic-primary/10 p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">컨테스트 기간</h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pic-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {currentTheme.startDate} ~ {currentTheme.endDate}
            </p>
          </div>
          <div className="bg-pic-primary text-white text-xs px-3 py-1.5 rounded-full font-bold">
            D-{daysLeft}
          </div>
        </div>
      </div>

      {/* 참가 버튼 */}
      {!hasSubmitted && (
        <div className="px-6 mb-6">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-pic-primary text-white py-3.5 rounded-xl font-medium hover:bg-[#7cc948] active:bg-[#66a13e] transition-colors shadow-md flex items-center justify-center"
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
      <div className="flex justify-between items-center px-6 mb-4">
        <h2 className="font-bold text-gray-800 text-lg">참가 작품</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setSortOption("likes")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
              sortOption === "likes"
                ? "bg-pic-primary text-white font-medium shadow-sm"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            좋아요순
          </button>
          <button
            onClick={() => setSortOption("newest")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
              sortOption === "newest"
                ? "bg-pic-primary text-white font-medium shadow-sm"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      {/* 참가 작품 목록 */}
      <div className="px-6 space-y-6">
        {entries.length > 0 ? (
          entries.map((entry, index) => {
            // 마지막 게시글인 경우 ref 적용
            const isLastEntry = entries.length === index + 1;
            return (
              <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mr-3 border border-gray-200">
                      <img
                        src={`https://picsum.photos/50/50?random=${entry.id}`}
                        alt={entry.userNickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{entry.userNickname}</h3>
                      <p className="text-xs text-gray-500">{entry.timestamp}</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-1.5 text-gray-800">{entry.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{entry.description}</p>
                </div>

                <div className="mb-3 overflow-hidden bg-gray-50 max-h-80 flex items-center justify-center">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleLike(entry.id)}
                      className={`flex items-center py-1 px-3 rounded-full ${
                        entry.isLiked 
                          ? "text-red-500 bg-red-50" 
                          : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={entry.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span className="font-medium">{entry.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">아직 참가 작품이 없습니다</p>
            <p className="mt-1">첫 번째 참가자가 되어보세요!</p>
          </div>
        )}
        
        {/* 로딩 표시 */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-pic-primary border-r-transparent rounded-full"></div>
          </div>
        )}
        
        {/* 무한스크롤을 위한 관찰 요소 */}
        <div ref={scrollRef} className="w-full h-4"></div>
      </div>

      {/* 이전 컨테스트 우승자 섹션 제거 */}

      {/* 사진 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">컨테스트 참가하기</h2>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 제목 입력 */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pic-primary focus:border-transparent"
                  maxLength={50}
                  placeholder="작품 제목을 입력하세요 (최대 50자)"
                />
              </div>

              {/* 설명 입력 */}
              <div className="mb-5">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  설명
                </label>
                <textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pic-primary focus:border-transparent"
                  rows={3}
                  maxLength={200}
                  placeholder="작품에 대한 설명을 입력하세요 (최대 200자)"
                ></textarea>
              </div>

              {/* 오류 메시지 */}
              {uploadError && (
                <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {uploadError}
                  </div>
                </div>
              )}

              {/* 이미지 업로드 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이미지 업로드
                </label>
                <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
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
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
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
                    <div className="text-center py-6">
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
                        className="mx-auto text-gray-400 mb-3"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                        <circle cx="12" cy="13" r="3"></circle>
                      </svg>
                      <p className="text-sm text-gray-500 mb-3">
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
                        className="px-4 py-2 bg-pic-primary text-white text-sm rounded-lg hover:bg-[#7cc948] transition-colors font-medium"
                      >
                        이미지 선택
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG 파일만 허용됩니다. 최대 파일 크기: 5MB
                </p>
              </div>

              {/* 버튼 영역 */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`flex-1 py-3 px-4 bg-pic-primary text-white rounded-lg font-medium hover:bg-[#7cc948] transition-colors shadow-md
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