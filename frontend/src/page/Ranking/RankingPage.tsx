// src/page/Ranking/RankingPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { timeAttackApi } from "../../api/timeAttackApi";
import { arenaApi, ArenaRankingUser } from "../../api/arenaApi";
import ContentNavBar from "../../components/NavBar/ContentNavBar";

// Import medal images
import goldTrophy from "../../assets/gold.png";
import silverTrophy from "../../assets/silver.png";
import bronzeTrophy from "../../assets/bronze.png";

// 랭킹 타입
type RankingType = "timeAttack" | "contest" | "arena";

const TOPIC_TRANSLATIONS: Record<string, string> = {
  dog: "강아지",
  cat: "고양이",
  flower: "꽃",
  car: "자동차",
  tree: "나무",
  food: "음식",
  mountain: "산",
  sky: "하늘",
  book: "책",
  cup: "컵",
  chair: "의자",
  clock: "시계",
  computer: "컴퓨터",
  plant: "식물",
  table: "테이블",
  building: "건물",
  shoes: "신발",
  pavement: "포장도로",
  mouse: "마우스",
  door: "문",
  window: "창문",
  clothes: "옷",
  bag: "가방",
  phone: "전화기",
  keyboard: "키보드",
  Screen: "스크린",
};

// 주제 번역 함수
const translateTopic = (englishTopic: string): string => {
  return TOPIC_TRANSLATIONS[englishTopic.toLowerCase()] || englishTopic;
};

// API 응답 타입 정의
interface RankingApiUser {
  userId: number;
  nickName: string;
  profileImage: string;
  imageUrl: string;
  topic: string;
  score: number;
  rank: number;
}

// Arena 랭킹 사용자 타입 정의
interface ArenaRankingApiUser extends ArenaRankingUser {
  imageUrl?: string;
  topic?: string;
  rank?: number; // 랭킹 번호(프론트엔드에서 계산되는 값)
}

// 랭킹 사용자 타입 정의 (애플리케이션 내에서 사용)
type RankingUser = RankingApiUser | ArenaRankingApiUser;

// 필터링 기간 타입
type TimeFrame = "today" | "week" | "month" | "all";

const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 상태 관리
  const [arenaRankings, setArenaRankings] = useState<RankingUser[]>([]);
  const [timeAttackRankings, setTimeAttackRankings] = useState<RankingUser[]>([]);
  const [contestRankings, setContestRankings] = useState<RankingUser[]>([]);
  
  const [arenaTopThree, setArenaTopThree] = useState<RankingUser[]>([]);
  const [timeAttackTopThree, setTimeAttackTopThree] = useState<RankingUser[]>([]);
  const [contestTopThree, setContestTopThree] = useState<RankingUser[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [timeframe, setTimeframe] = useState<TimeFrame>("all");
  const [rankingType, setRankingType] = useState<RankingType>("arena");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // 모달 관련 상태
  const [selectedUser, setSelectedUser] = useState<RankingUser | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // 페이지 요청 관련 디버깅용 ref
  const requestDebugRef = useRef(0);
  // 첫 페이지 로드 여부 체크 ref
  const isFirstLoad = useRef(true);

  // 랭킹 데이터 불러오기
  useEffect(() => {
    console.log(`페이지네이션 이벤트: rankingType=${rankingType}, currentPage=${currentPage}, totalPages=${totalPages}`);

    // Contest 랭킹은 아직 데이터가 없으므로 API 호출하지 않음
    if (rankingType === "contest") {
      setContestRankings([]);
      setContestTopThree([]);
      setIsLoading(false);
      return;
    }
    
    // 로딩 처리
    setIsLoading(true);
    setError(null);
    requestDebugRef.current += 1;
    const requestId = requestDebugRef.current;
    console.log(`[API 요청] ${rankingType} 페이지 ${currentPage} 요청 시작 (ID: ${requestId})`);

    const fetchTimeAttackRankings = async () => {
      try {
        // 타임어택 랭킹 API 호출
        console.log(`TimeAttack API 호출, 페이지: ${currentPage}`);
        const response = await timeAttackApi.getRanking(currentPage);
        console.log('TimeAttack API 응답:', response);
        const responseData = response.data;
        const data = responseData.data;

        if (data && data.ranking && Array.isArray(data.ranking)) {
          // API 응답을 애플리케이션 타입으로 명시적 변환
          const apiRankings = data.ranking as RankingApiUser[];
          setTimeAttackRankings(apiRankings);
          setTotalPages(data.totalPage || 1);

          // 첫 로드 시에만 상위 3명 설정
          if (currentPage === 1) {
            const topUsers = apiRankings
              .filter((user) => (user.rank !== undefined && user.rank <= 3) || false)
              .slice(0, 3);
            setTimeAttackTopThree(topUsers);
          }
        } else {
          throw new Error("타임어택 랭킹 데이터가 올바른 형식이 아닙니다.");
        }
      } catch (error) {
        console.error("Error fetching time attack rankings:", error);
        // 오류 처리: 페이지가 없는 경우 이전 페이지로 돌아가거나 최대 페이지를 조회
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log('요청한 페이지가 없습니다. 최대 페이지 재조회 시도');
          // 타임어택 최대 페이지 가져오기(1페이지)
          try {
            const maxPageResponse = await timeAttackApi.getRanking(1);
            const maxPageData = maxPageResponse.data.data;
            if (maxPageData && maxPageData.totalPage > 0) {
              // 최대 페이지 설정
              setTotalPages(maxPageData.totalPage);
              // 현재 페이지가 최대 페이지보다 큰 경우 최대 페이지로 이동
              if (currentPage > maxPageData.totalPage) {
                console.log(`페이지 재설정: ${currentPage} -> ${maxPageData.totalPage}`);
                setCurrentPage(maxPageData.totalPage);
                return; // 페이지 변경 후 재실행
              }
            }
          } catch (maxPageError) {
            console.error('Max page fetch error:', maxPageError);
          }
        }
        
        setTimeAttackRankings([]);
        if (rankingType === "timeAttack") {
          setError("타임어택 랭킹 데이터를 가져오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (rankingType === "timeAttack") {
          setIsLoading(false);
          console.log(`[API 응답] timeAttack 페이지 ${currentPage} 요청 완료 (ID: ${requestId})`);
        }
      }
    };

    const fetchArenaRankings = async () => {
      try {
        // 아레나 랭킹 API 호출
        console.log(`Arena API 호출, 페이지: ${currentPage}`);
        const response = await arenaApi.getArenaRanking(currentPage);
        console.log('Arena API 응답:', response);
        const responseData = response.data;
        const data = responseData.data;

        if (data && data.ranking && Array.isArray(data.ranking)) {
          // API 응답을 애플리케이션 타입으로 명시적 변환
          const apiRankings = data.ranking as ArenaRankingApiUser[];

          // 점수순으로 정렬하고 랭킹 부여
          const rankedUsers = apiRankings
            .sort((a, b) => b.score - a.score)
            .map((user, index) => ({
              ...user,
              rank: index + 1, // 점수 기준으로 랭킹 부여
            }));

          setArenaRankings(rankedUsers);
          setTotalPages(data.totalPage || 1);

          // 첫 로드 시에만 상위 3명 설정
          if (currentPage === 1) {
            const topUsers = rankedUsers.slice(0, 3);
            setArenaTopThree(topUsers);
          }
        } else {
          throw new Error("아레나 랭킹 데이터가 올바른 형식이 아닙니다.");
        }
      } catch (error) {
        console.error("Error fetching arena rankings:", error);
        // 오류 처리: 페이지가 없는 경우 이전 페이지로 돌아가거나 최대 페이지를 조회
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log('요청한 페이지가 없습니다. 최대 페이지 재조회 시도');
          // 아레나 최대 페이지 가져오기(1페이지)
          try {
            const maxPageResponse = await arenaApi.getArenaRanking(1);
            const maxPageData = maxPageResponse.data.data;
            if (maxPageData && maxPageData.totalPage > 0) {
              // 최대 페이지 설정
              setTotalPages(maxPageData.totalPage);
              // 현재 페이지가 최대 페이지보다 큰 경우 최대 페이지로 이동
              if (currentPage > maxPageData.totalPage) {
                console.log(`페이지 재설정: ${currentPage} -> ${maxPageData.totalPage}`);
                setCurrentPage(maxPageData.totalPage);
                return; // 페이지 변경 후 재실행
              }
            }
          } catch (maxPageError) {
            console.error('Max page fetch error:', maxPageError);
          }
        }
        
        setArenaRankings([]);
        if (rankingType === "arena") {
          setError("아레나 랭킹 데이터를 가져오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (rankingType === "arena") {
          setIsLoading(false);
          console.log(`[API 응답] arena 페이지 ${currentPage} 요청 완료 (ID: ${requestId})`);
        }
      }
    };

    // 로그인 상태에 따라 API 호출
    if (isLoggedIn) {
      if (rankingType === "timeAttack") {
        fetchTimeAttackRankings();
      } else if (rankingType === "arena") {
        fetchArenaRankings();
      }
      
      // 첫 번째 로드일 경우 두 랭킹 모두 불러오기
      if (isFirstLoad.current && currentPage === 1) {
        if (rankingType === "timeAttack") {
          // 아레나 데이터도 같이 불러오기 (배경에서)
          fetchArenaRankings();
        } else if (rankingType === "arena") {
          // 타임어택 데이터도 같이 불러오기 (배경에서)
          fetchTimeAttackRankings();
        }
        isFirstLoad.current = false;
      }
    } else {
      setIsLoading(false);
      setError("로그인이 필요한 서비스입니다.");
    }
  }, [currentPage, isLoggedIn, rankingType]);

  // URL 쿼리 파라미터에서 탭 설정 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    // 탭 파라미터가 있는 경우 해당 탭으로 설정
    if (tabParam === 'timeAttack') {
      setRankingType('timeAttack');
      console.log('타임어택 탭으로 설정');
    } else if (tabParam === 'arena') {
      setRankingType('arena');
    } else if (tabParam === 'contest') {
      setRankingType('contest');
    }
  }, [location.search]);



  // 랭킹 유형 변경 시 데이터 리셋
  useEffect(() => {
    // 랭킹 유형 변경 시 페이지 번호를 1로 리셋
    setCurrentPage(1);
    // 선택된 유저 초기화
    setSelectedUser(null);
    setModalOpen(false);
    
    // 이미 해당 랭킹 데이터가 있다면 로딩 상태를 false로 설정
    if (rankingType === 'timeAttack' && timeAttackRankings.length > 0) {
      setIsLoading(false);
      
      // TOP3가 없는 경우 다시 상위 3명 설정
      if (timeAttackTopThree.length === 0) {
        const topUsers = timeAttackRankings
          .filter((user) => (user.rank !== undefined && user.rank <= 3) || false)
          .slice(0, 3);
        if (topUsers.length > 0) {
          setTimeAttackTopThree(topUsers);
        }
      }
    } else if (rankingType === 'arena' && arenaRankings.length > 0) {
      setIsLoading(false);
      
      // TOP3가 없는 경우 다시 상위 3명 설정
      if (arenaTopThree.length === 0) {
        const topUsers = arenaRankings.slice(0, 3);
        if (topUsers.length > 0) {
          setArenaTopThree(topUsers);
        }
      }
    } else if (rankingType === 'contest') {
      setIsLoading(false);
    }
    
    console.log('Current ranking type:', rankingType);
    console.log('Arena top three:', arenaTopThree);
    console.log('Time attack top three:', timeAttackTopThree);
  }, [rankingType, timeAttackRankings, arenaRankings, timeAttackTopThree, arenaTopThree]);

  // 랭킹 아이템 클릭 핸들러
  const handleRankingItemClick = (user: RankingUser) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // 프로필로 이동 핸들러
  const handleGoToProfile = (userId: number) => {
    navigate(`/user/profile/${userId}`);
    setModalOpen(false);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // 페이지 이동 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      console.log(`다음 페이지로 이동: ${currentPage} -> ${currentPage + 1}`);
      // 페이지 이동을 위해 함수형 업데이트 사용
      setCurrentPage(prev => prev + 1);
    } else {
      console.log('이미 마지막 페이지입니다');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      console.log(`이전 페이지로 이동: ${currentPage} -> ${currentPage - 1}`);
      // 페이지 이동을 위해 함수형 업데이트 사용
      setCurrentPage(prev => prev - 1);
    } else {
      console.log('이미 첫 번째 페이지입니다');
    }
  };

  // 타임프레임 변경 핸들러 (백엔드 지원 시 활성화)
  const handleTimeFrameChange = (frame: TimeFrame) => {
    // 현재는 백엔드에서 지원하지 않으므로 UI만 변경
    setTimeframe(frame);
    //setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  // 랭킹 유형 변경 핸들러
  const handleRankingTypeChange = (type: RankingType) => {
    if (type !== rankingType) {
      console.log(`랭킹 타입 변경: ${rankingType} -> ${type}`);
      // 페이지 번호를 1로 리셋
      setCurrentPage(1);
      // 랭킹 타입 변경
      setRankingType(type);
    }
  };

  // 랭킹 사진 모달 컴포넌트
  const RankingModal = ({
    user,
    isOpen,
    onClose,
  }: {
    user: RankingUser | null;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!isOpen || !user) return null;

    // Arena 랭킹과 TimeAttack 랭킹 구분
    const isArenaRanking = !("topic" in user);

    return (
      <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center">
              <span className="font-bold text-lg">#{user.rank || "-"}</span>
              <div
                className="flex items-center ml-2 cursor-pointer"
                onClick={() => handleGoToProfile(user.userId)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                  <img
                    src={user.profileImage || "/default-profile.jpg"}
                    alt={`${user.nickName}의 프로필`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-profile.jpg";
                    }}
                  />
                </div>
                <div>
                  <span className="font-semibold">{user.nickName}</span>
                  <div className="text-xs text-blue-500">프로필 보기</div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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

          {isArenaRanking ? (
            // 아레나 랭킹 표시
            <div className="p-6">
              <div className="mb-6 text-center">
                <span className="text-2xl font-bold text-pic-primary">
                  아레나 랭킹
                </span>
              </div>

              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-gray-600 text-sm mb-2">점수</h3>
                <p className="text-xl font-bold text-pic-primary">
                  {"score" in user ? user.score : "-"}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">랭킹</h3>
                  <p className="font-bold text-xl text-pic-primary">
                    #{user.rank || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">닉네임</h3>
                  <p className="font-bold text-xl text-gray-700">
                    {user.nickName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // 타임어택 랭킹 표시
            <>
              {/* 이미지 */}
              <div className="relative">
                <img
                  src={"imageUrl" in user ? user.imageUrl : ""}
                  alt={`${user.nickName}의 타임어택 사진`}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white py-1 px-3 rounded-full text-sm font-bold">
                  {typeof user.score === "number"
                    ? user.score.toFixed(1)
                    : user.score}
                  점
                </div>
              </div>

              {/* 주제 및 정보 */}
              <div className="p-4">
                {"topic" in user && user.topic && (
                  <div className="mb-4">
                    <h3 className="text-gray-500 text-sm mb-1">주제</h3>
                    <p className="font-semibold text-xl">
                      {translateTopic(user.topic)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-500 text-sm mb-1">랭킹</h3>
                    <p className="font-bold text-xl text-pic-primary">
                      #{user.rank || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm mb-1">점수</h3>
                    <p className="font-bold text-xl text-pic-primary">
                      {typeof user.score === "number"
                        ? user.score.toFixed(1)
                        : user.score}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // 트로피 카드 컴포넌트
  const TrophyCard = ({
    user,
    rank,
    trophyImage,
  }: {
    user?: RankingUser;
    rank: number;
    trophyImage: string;
  }) => {
    if (!user) {
      return (
        <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm opacity-50">
          <div className="mb-4">
            <img
              src={trophyImage}
              alt={`${rank}등 트로피`}
              className="w-16 h-20 object-contain"
            />
            <div className="text-center font-bold mt-1 text-xl">{rank}</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#AAAAAA"
              stroke="#AAAAAA"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="text-center mt-2 font-medium text-gray-400">없음</div>
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm cursor-pointer hover:bg-gray-50"
        onClick={() => handleRankingItemClick(user)}
      >
        <div className="mb-4">
          <img
            src={trophyImage}
            alt={`${rank}등 트로피`}
            className="w-16 h-20 object-contain"
          />
        </div>
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.nickName} 프로필`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-profile.jpg"; // 로드 실패 시 기본 이미지
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#AAAAAA"
              stroke="#AAAAAA"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </div>
        <div className="text-center mt-2 font-medium">{user.nickName}</div>
      </div>
    );
  };

  // 현재 탭에 따른 데이터 선택
  const currentRankings = (() => {
    switch (rankingType) {
      case "timeAttack":
        return timeAttackRankings;
      case "arena":
        return arenaRankings;
      case "contest":
        return contestRankings;
      default:
        return [];
    }
  })();

  // 현재 탭에 따른 TOP3 선택
  const currentTopThree = (() => {
    switch (rankingType) {
      case "timeAttack":
        return timeAttackTopThree;
      case "arena":
        return arenaTopThree;
      case "contest":
        return contestTopThree;
      default:
        return [];
    }
  })();

  // 상위 3명 데이터 가져오기
  const firstPlace =
    currentTopThree.find((user) => user.rank === 1) ||
    (currentTopThree.length > 0 ? currentTopThree[0] : undefined);
  const secondPlace =
    currentTopThree.find((user) => user.rank === 2) ||
    (currentTopThree.length > 1 ? currentTopThree[1] : undefined);
  const thirdPlace =
    currentTopThree.find((user) => user.rank === 3) ||
    (currentTopThree.length > 2 ? currentTopThree[2] : undefined);

  // 랭킹 유형에 따른 제목 반환
  const getRankingTitle = () => {
    switch (rankingType) {
      case "timeAttack":
        return "타임어택 랭킹";
      case "contest":
        return "컨테스트 랭킹";
      case "arena":
        return "아레나 랭킹";
      default:
        return "전체 랭킹";
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-gray-50 pb-16">
      {/* 랭킹 유형 탭 */}
      <div className="flex border-b bg-white mb-2 shadow-sm">
        <button
          className={`flex-1 py-4 text-center font-medium relative ${
            rankingType === "arena" ? "text-pic-primary" : "text-gray-600"
          }`}
          onClick={() => handleRankingTypeChange("arena")}
        >
          아레나
          {rankingType === "arena" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pic-primary"></div>
          )}
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium relative ${
            rankingType === "timeAttack" ? "text-pic-primary" : "text-gray-600"
          }`}
          onClick={() => handleRankingTypeChange("timeAttack")}
        >
          타임어택
          {rankingType === "timeAttack" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pic-primary"></div>
          )}
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium relative ${
            rankingType === "contest" ? "text-pic-primary" : "text-gray-600"
          }`}
          onClick={() => handleRankingTypeChange("contest")}
        >
          컨테스트
          {rankingType === "contest" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pic-primary"></div>
          )}
        </button>
      </div>

      {/* TOP 3 섹션 - contest가 아니고 로딩 중이 아닀 때만 표시 */}
      {rankingType !== "contest" && !isLoading && currentTopThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 p-4">
          {/* 2등 */}
          <TrophyCard user={secondPlace} rank={2} trophyImage={silverTrophy} />

          {/* 1등 */}
          <TrophyCard user={firstPlace} rank={1} trophyImage={goldTrophy} />

          {/* 3등 */}
          <TrophyCard user={thirdPlace} rank={3} trophyImage={bronzeTrophy} />
        </div>
      )}

      {/* 랭킹 목록 섹션 */}
      <div className="p-5 mt-2 bg-white rounded-lg mx-4 border border-gray-200 shadow-md">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {getRankingTitle()}
          </h2>

          {/* 도전하기 버튼 - 컨테스트가 아닐 때만 표시 */}
          {rankingType !== "contest" && (
            <button
              onClick={() =>
                navigate(rankingType === "arena" ? "/arena" : "/time-attack")
              }
              className="bg-pic-primary hover:bg-pic-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              도전하기
            </button>
          )}
        </div>

        {/* 랭킹 테이블 헤더 - 랭킹 타입에 따라 다른 컴포넌트 렌더링 */}
        {rankingType === "arena" ? (
          // 아레나 랭킹 테이블 헤더
          <div className="bg-gray-100 p-2.5 grid grid-cols-3 font-medium rounded-t-lg text-gray-700 border-b border-gray-200">
            <div className="text-left pl-1">순위</div>
            <div className="text-left -ml-2">프로필</div>
            <div className="text-center">정답 횟수</div>
          </div>
        ) : (
          <div className="bg-gray-100 p-2.5 grid grid-cols-3 font-medium rounded-t-lg text-gray-700 border-b border-gray-200">
            <div className="text-left pl-1">순위</div>
            <div className="text-left -ml-2">프로필</div>
            <div className="text-right pr-6">점수</div>
          </div>
        )}

        {/* 컨테스트 준비 중 메시지 */}
        {rankingType === "contest" ? (
          <div className="p-8 text-center my-4">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {rankingType === "contest" ? "컨테스트" : "아레나"} 랭킹 준비 중
            </h3>
            <p className="text-gray-500">
              현재 {rankingType === "contest" ? "컨테스트" : "아레나"} 랭킹
              시스템을 준비 중입니다.
              <br />곧 서비스를 이용하실 수 있습니다.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg my-4">
            {error}
          </div>
        ) : currentRankings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 my-4">
            랭킹 정보가 없습니다
          </div>
        ) : rankingType === "arena" ? (
          /* 아레나 랭킹 목록 */
          <ul className="overflow-hidden rounded-b-lg border-x border-b border-gray-200">
            {currentRankings.map((user, index) => (
              <li
                key={user.userId}
                className={`py-2.5 grid grid-cols-3 items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  index % 2 === 1 ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => handleRankingItemClick(user)}
              >
                <div className="text-left pl-6">
                  <span
                    className={`inline-flex items-center justify-center font-bold ${
                      user.rank && user.rank <= 3
                        ? "text-pic-primary text-lg"
                        : "text-gray-700"
                    }`}
                  >
                    {user.rank || index + 1}
                  </span>
                </div>
                <div className="flex items-center -ml-11">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center mr-2 border border-gray-200 bg-white">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.nickName} 프로필`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-profile.jpg"; // 로드 실패 시 기본 이미지
                        }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#AAAAAA"
                        stroke="#AAAAAA"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <span className="truncate max-w-[100px] font-medium text-gray-800">
                    {user.nickName}
                  </span>
                </div>
                <div className="text-center font-medium text-gray-700">
                  {"score" in user ? user.score : "-"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          /* 타임어택 랭킹 목록 */
          <ul className="overflow-hidden rounded-b-lg border-x border-b border-gray-200">
            {currentRankings.map((user, index) => (
              <li
                key={user.userId}
                className={`py-2.5 grid grid-cols-3 items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  index % 2 === 1 ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => handleRankingItemClick(user)}
              >
                <div className="text-left pl-6">
                  <span
                    className={`inline-flex items-center justify-center font-bold ${
                      user.rank && user.rank <= 3
                        ? "text-pic-primary text-lg"
                        : "text-gray-700"
                    }`}
                  >
                    {user.rank || index + 1}
                  </span>
                </div>
                <div className="flex items-center -ml-11">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center mr-2 border border-gray-200 bg-white">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.nickName} 프로필`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/default-profile.jpg"; // 로드 실패 시 기본 이미지
                        }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#AAAAAA"
                        stroke="#AAAAAA"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <span className="truncate max-w-[100px] font-medium text-gray-800">
                    {user.nickName}
                  </span>
                </div>
                <div className="text-right pr-8 font-bold text-pic-primary">
                  {typeof user.score === "number"
                    ? user.score.toFixed(1)
                    : user.score}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 - contest가 아니고 로딩 중이 아니고 데이터가 있을 때만 표시 */}
        {rankingType !== "contest" && !isLoading && currentRankings.length > 0 && (
          <div className="flex flex-col items-center pt-5 mt-4 border-t border-gray-100">
            {/* 페이지 정보 표시 */}
            <div className="mb-4 text-gray-700 text-center font-medium">
              <span className="text-pic-primary font-bold">{currentPage}</span> <span className="text-gray-400">/</span> <span>{totalPages || 1}</span>
              <div className="text-xs text-gray-500 mt-1">페이지</div>
            </div>

            {/* 페이지 네비게이션 버튼 */}
            <div className="flex justify-between w-full">
              <button
                onClick={handlePrevPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentPage === 1
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-200 active:bg-gray-200 bg-gray-100"
                }`}
                disabled={currentPage === 1 || isLoading}
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
                  className="mr-1"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                이전 페이지
              </button>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-pic-primary flex items-center justify-center text-white font-bold shadow-sm">
                  {currentPage}
                </div>
              </div>

              <button
                onClick={handleNextPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-200 active:bg-gray-200 bg-gray-100"
                }`}
                disabled={currentPage === totalPages || isLoading}
              >
                다음 페이지
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
                  className="ml-1"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 랭킹 사진 모달 */}
      <RankingModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default RankingPage;
