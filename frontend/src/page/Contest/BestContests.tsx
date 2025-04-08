import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { testApi } from "../../api/api";

// 우수작 타입 정의
interface BestContestEntry {
  id: number;
  contestId: number;
  contestWeek: string;
  userId: string;
  userNickname: string;
  imageUrl: string;
  title: string;
  description: string;
  likes: number;
  timestamp: string;
}

function BestContests() {
  const navigate = useNavigate();
  
  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [bestEntries, setBestEntries] = useState<BestContestEntry[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  
  // 데이터 로드
  useEffect(() => {
    // 실제 API 호출은 주석 처리 (백엔드 개발 후 사용)
    // const fetchBestEntries = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await testApi.get('/api/v1/contest/best');
    //     setBestEntries(response.data.data);
    //     
    //     // 주차 목록 생성
    //     const uniqueWeeks = [...new Set(response.data.data.map((entry: BestContestEntry) => entry.contestWeek))];
    //     setWeeks(uniqueWeeks);
    //   } catch (error) {
    //     console.error('우수작 불러오기 오류:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchBestEntries();
    
    // 테스트용 더미 데이터
    const mockData: BestContestEntry[] = [
      {
        id: 1,
        contestId: 1,
        contestWeek: "2025년 3월 1주",
        userId: "user1",
        userNickname: "사진작가123",
        imageUrl: "https://picsum.photos/400/300?random=101",
        title: "산 속의 아침 풍경",
        description: "해돋이 순간의 아름다운 산 풍경을 담았습니다.",
        likes: 124,
        timestamp: "2025-03-01",
      },
      {
        id: 2,
        contestId: 1,
        contestWeek: "2025년 3월 1주",
        userId: "user2",
        userNickname: "풍경사진가",
        imageUrl: "https://picsum.photos/400/300?random=102",
        title: "바다의 일몰",
        description: "저녁 노을이 비치는 평화로운 해변 풍경입니다.",
        likes: 112,
        timestamp: "2025-03-02",
      },
      {
        id: 3,
        contestId: 2,
        contestWeek: "2025년 3월 2주",
        userId: "user3",
        userNickname: "naturelover",
        imageUrl: "https://picsum.photos/400/300?random=103",
        title: "푸른 호수 반영",
        description: "고요한 호수에 반영된 산과 나무의 모습",
        likes: 98,
        timestamp: "2025-03-10",
      },
      {
        id: 4,
        contestId: 3,
        contestWeek: "2025년 3월 3주",
        userId: "user4",
        userNickname: "도시사진사",
        imageUrl: "https://picsum.photos/400/300?random=104",
        title: "도시의 밤",
        description: "밤에 활기찬 도시의 야경을 담았습니다.",
        likes: 87,
        timestamp: "2025-03-17",
      },
      {
        id: 5,
        contestId: 4,
        contestWeek: "2025년 3월 4주",
        userId: "user5",
        userNickname: "스냅슈터",
        imageUrl: "https://picsum.photos/400/300?random=105",
        title: "봄의 시작",
        description: "막 피어나기 시작한 벚꽃을 담았습니다.",
        likes: 76,
        timestamp: "2025-03-24",
      },
    ];
    
    // 주차 목록 생성
    const uniqueWeeks = [...new Set(mockData.map((entry) => entry.contestWeek))];
    
    setBestEntries(mockData);
    setWeeks(uniqueWeeks);
    setLoading(false);
  }, []);
  
  // 필터링된 우수작 목록
  const filteredEntries = selectedWeek === "all" 
    ? bestEntries
    : bestEntries.filter((entry) => entry.contestWeek === selectedWeek);
  
  // 주차별로 정렬된 우수작 (각 주차의 1위 작품만 표시)
  const topEntriesByWeek = weeks.map((week) => {
    const weekEntries = bestEntries.filter(entry => entry.contestWeek === week);
    // 좋아요 순으로 정렬
    const sortedEntries = [...weekEntries].sort((a, b) => b.likes - a.likes);
    // 1위 작품 반환
    return sortedEntries.length > 0 ? sortedEntries[0] : null;
  }).filter(entry => entry !== null) as BestContestEntry[];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white min-h-screen pb-16">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-pic-primary/10 to-pic-primary/20 p-6 mb-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">주간 우수작</h1>
        </div>
        <p className="text-gray-600 text-sm">
          매주 좋아요를 가장 많이 받은 작품을 확인해보세요!
        </p>
      </div>
      
      {/* 필터 */}
      <div className="px-6 mb-6">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          <button
            onClick={() => setSelectedWeek("all")}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              selectedWeek === "all"
                ? "bg-pic-primary text-white font-medium"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            전체 보기
          </button>
          {weeks.map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                selectedWeek === week
                  ? "bg-pic-primary text-white font-medium"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {week}
            </button>
          ))}
        </div>
      </div>
      
      {/* 로딩 상태 */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin h-10 w-10 border-4 border-pic-primary border-r-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* 선택한 주차가 "전체"인 경우 각 주차 우승 작품 표시 */}
          {selectedWeek === "all" ? (
            <div className="px-6 space-y-8">
              {topEntriesByWeek.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="relative">
                    {/* 주차 표시 */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                      {entry.contestWeek} 우수작
                    </div>
                    {/* 좋아요 표시 */}
                    <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {entry.likes}
                    </div>
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden mr-2 border border-gray-200">
                        <img
                          src={`https://picsum.photos/32/32?random=${entry.id}`}
                          alt={entry.userNickname}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-800">{entry.userNickname}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{entry.title}</h3>
                    <p className="text-gray-600 text-sm">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 특정 주차를 선택한 경우 해당 주차의 상위 작품들 표시
            <div className="px-6 space-y-6">
              {filteredEntries.length > 0 ? (
                filteredEntries
                  .sort((a, b) => b.likes - a.likes)
                  .map((entry, index) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                      <div className="relative">
                        {/* 순위 표시 */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                          {index + 1}위
                        </div>
                        {/* 좋아요 표시 */}
                        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {entry.likes}
                        </div>
                        <img
                          src={entry.imageUrl}
                          alt={entry.title}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden mr-2 border border-gray-200">
                            <img
                              src={`https://picsum.photos/32/32?random=${entry.id}`}
                              alt={entry.userNickname}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-gray-800">{entry.userNickname}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{entry.title}</h3>
                        <p className="text-gray-600 text-sm">{entry.description}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">선택한 주차에 우수작이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BestContests;
