import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import contest from "../../assets/contest.png";
import time from "../../assets/time.png";
import board from "../../assets/board.png";
import ranking from "../../assets/ranking.png";
import camera from "../../assets/camera.png";
// import arena from "../../assets/arena.png"; // 아레나 아이콘 (이미지 필요)
import { useAuthStore } from "../../store/authStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import HomeNavBar from "../../components/NavBar/HomeNavBar";
import axios from "axios";
import { useLogout, useMyProfile } from "../../hooks/useUser";
import { chickenService } from "../../api/chickenApi";
import { testApi } from "../../api/api";
import { sendUserFeedback } from "../../utils/sentry";

function Home() {
  // 치킨받기 모달 관리
  const [showChickenModal, setShowChickenModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showGameModal, setShowGameModal] = useState(false); // 게임 선택 모달 상태
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const setUserId = useAuthStore((state) => state.setUserId);
  const [expPercentage, setExpPercentage] = useState(0);
  const logoutMutation = useLogout();
  const params = new URLSearchParams(window.location.search);
  const loginSuccess = params.get("loginSuccess");

  // const {
  //   isLoading: profileLoading,
  //   isError: profileError,
  //   data: profileData,
  // } = useMyProfile();

  const useUserData = () => {
    return useQuery({
      queryKey: ["userData"],
      queryFn: async () => {
        const response = await testApi.get("/api/v1/user/info");
        return response.data;
      },
    });
  };

  // 기존 useUserData는 유지 (userId 설정 등 필요)
  const { isLoading, isError, data: userData } = useUserData();

  const chickenMutation = useMutation({
    mutationFn: (data: { phoneNumber: string; message: string }) => {
      sendUserFeedback(userData.data.nickname, data.message);
      return chickenService.requestChicken(data);
    },
    onSuccess: () => {
      // 요청 성공 시 실행할 코드
      setShowChickenModal(false);
      setPhoneNumber("");
      setMessage("");
      alert("치킨받기 신청이 완료되었습니다!");
    },
    onError: (error) => {
      // 에러 처리
      console.error("치킨받기 요청 에러:", error);
      alert("요청 처리에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        navigate("/login");
      },
    });
  };
  // 폼 제출 처리
  const handleChickenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 백엔드 API로 데이터 전송
    chickenMutation.mutate({ phoneNumber, message });
  };

  /*
  원래 로직
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);


  const { isLoading, isError, data } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.get("/api/v1/user/info");
      return response.data.data;
    },
    enabled: !!loginSuccess, // loginSuccess가 true일 때만 쿼리 실행
  });

   
  if (isLoading) {
    return <>로딩중..</>;
  }
  if (isError) {
    return <>유저 정보 호출 에러</>;
  }
  */

  /* 테스트 로직 */

  // 경험치 퍼센티지 계산 함수 - 백엔드 로직과 정확히 일치하도록 적용
  const calcExpPercentage = (
    experience: number,
    currentLevel: number
  ): number => {
    // 각 레벨업에 필요한 임계값(다음 레벨업 기준) 계산
    let level = 0;
    let threshold = 1000;
    let increment = 500;

    // 레벨과 레벨업에 필요한 임계값 계산 - 백엔드 코드와 동일
    // 백엔드는 현재 경험치가 임계값보다 크거나 같을 때까지 레벨업
    const expCopy = experience; // 원본 유지

    while (expCopy >= threshold) {
      level++;
      increment += 500;
      threshold += increment;
    }

    // 다음 레벨업에 필요한 경험치와 현재 경험치의 비율
    const progress = (experience / threshold) * 100;

    return Math.min(Math.max(progress, 0), 100);
  };

  // 마이페이지와 동일한 사용자 프로필 정보 API 사용

  // 기존 유저 데이터 API 유지 (userId 설정 필요)

  useEffect(() => {
    // userId 설정 유지
    if (userData && loginSuccess) {
      setUserId(userData.data.userId, userData.data.nickname);
    }
  }, [userData, loginSuccess]);

  // 프로필 데이터가 로딩되면 한 번만 경험치 계산
  useEffect(() => {
    if (userData) {
      const experience = userData.data.experience;
      const currentLevel = userData.data.level;

      // 경험치 퍼센티지 계산
      const percentage = calcExpPercentage(experience, currentLevel);
      setExpPercentage(percentage);
    }
  }, [userData]);

  // 로딩 및 에러 처리 (프로필 API와 유저 데이터 API 모두 확인)
  // if (userData || userDataLoading) {
  //   return <>로딩중 입니다</>;
  // }
  // if (userData || userDataError) {
  //   return <>에러입니다</>;
  // }
  if (isLoading) {
    return <></>;
  }
  return (
    <>
      <div className="flex flex-col w-full items-center justify-center pt-6 px-3">
        <HomeNavBar />

        {/* 프로필 이미지 섹션 */}
        <Link
          to="/mypage"
          className="flex flex-col items-center mb-3 mt-2 border-2 border-gray-300 rounded-3xl shadow-lg p-4 bg-white w-[90%]"
          cursor-pointer
        >
          <div className="flex flex-row items-center w-full px-4 gap-4">
            {/* 프로필 이미지 */}
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white">
              <img
                src={userData.data.profileImage}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
              />
            </div>
            {/* 이름 */}
            <h2 className="font-bold text-gray-800 text-2xl">
              {userData.data.nickname}
            </h2>
          </div>

          {/* 레벨과 레벨 바 */}
          <div className="w-[200px] text-center flex items-center mt-3 mb-1">
            <span className="font-bold text-gray-800 mr-2">
              LV.{userData.data.level || userData.data.level || 0}
            </span>
            <div className="bg-gray-200 h-3 rounded-full flex-1">
              <div
                className="h-full bg-pic-primary rounded-full"
                style={{
                  width: `${expPercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </Link>
        {/* 기존 사진 분석 버튼 제거 */}
        {/* 메뉴 그리드 섹션 */}
        <div className="grid grid-cols-2 gap-3 w-full p-2 max-w-[380px]">
          {/* ACTIVITY 버튼 (이전 타임어택) */}
          <div
            onClick={() => setShowGameModal(true)}
            className="bg-white rounded-xl p-3 flex flex-col items-center shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-white rounded-xl shadow-xl"></div>
            <div className="relative mb-2 z-10">
              <div className="absolute -inset-[0.5rem] rounded-full bg-pic-primary opacity-40 blur-sm -z-10 transition-opacity duration-300 group-hover:opacity-60"></div>
              <div className="w-16 h-16 rounded-full bg-pic-primary flex items-center justify-center shadow-sm relative transition-transform duration-300 hover:scale-105">
                <img src={time} alt="시계 아이콘" className="w-8 h-8" />
              </div>
            </div>
            <span className="font-bold text-gray-700 text-sm relative z-10">
              액티비티
            </span>
          </div>

          {/* 사진 분석 */}
          <Link to="/image-upload">
            <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-white rounded-xl shadow-xl"></div>
              <div className="relative mb-2 z-10">
                <div className="absolute -inset-[0.5rem] rounded-full bg-pic-primary opacity-40 blur-sm -z-10 transition-opacity duration-300 group-hover:opacity-60"></div>
                <div className="w-16 h-16 rounded-full bg-pic-primary flex items-center justify-center shadow-sm relative transition-transform duration-300 hover:scale-105">
                  <img src={camera} alt="사진기 아이콘" className="w-8 h-8" />
                </div>
              </div>
              <span className="font-bold text-gray-700 text-sm relative z-10">
                사진 분석
              </span>
            </div>
          </Link>

          {/* 게시글 */}
          <Link to="/board">
            <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-white rounded-xl shadow-xl"></div>
              <div className="relative mb-2 z-10">
                <div className="absolute -inset-[0.625rem] rounded-full bg-pic-primary opacity-40 blur-sm -z-10 transition-opacity duration-300 group-hover:opacity-60"></div>
                <div className="w-16 h-16 rounded-full bg-pic-primary flex items-center justify-center shadow-sm relative transition-transform duration-300 hover:scale-105">
                  <img src={board} alt="게시판 아이콘" className="w-8 h-8" />
                </div>
              </div>
              <span className="font-bold text-gray-700 text-sm relative z-10">
                게시글
              </span>
            </div>
          </Link>

          {/* 랭킹 */}
          <Link to="/ranking">
            <div className="bg-white rounded-xl p-3 flex flex-col items-center shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-white rounded-xl shadow-xl"></div>
              <div className="relative mb-2 z-10">
                <div className="absolute -inset-[0.625rem] rounded-full bg-pic-primary opacity-40 blur-sm -z-10 transition-opacity duration-300 group-hover:opacity-60"></div>
                <div className="w-16 h-16 rounded-full bg-pic-primary flex items-center justify-center shadow-sm relative transition-transform duration-300 hover:scale-105">
                  <img src={ranking} alt="차트 아이콘" className="w-8 h-8" />
                </div>
              </div>
              <span className="font-bold text-gray-700 text-sm relative z-10">
                랭킹
              </span>
            </div>
          </Link>
        </div>

        {/* 치킨받기 가로로 긴 버튼 */}
        <div className="w-full max-w-[380px] px-3 mb-3 mt-2">
          <div
            className="bg-white rounded-xl p-3 flex items-center justify-center shadow-lg relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer w-full"
            onClick={() => setShowChickenModal(true)}
          >
            <div className="absolute inset-0 bg-white rounded-xl shadow-xl"></div>
            <div className="relative flex items-center">
              <span className="text-2xl mr-3">🐣</span>
            </div>
          </div>
        </div>
      </div>

      {/* 치킨받기 모달 */}
      {showChickenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg w-[85%] max-w-md">
            <h2 className="text-xl font-bold mb-3 text-center text-pic-primary">
              피드백 보내기
            </h2>

            <form onSubmit={handleChickenSubmit}>
              {/* 전화번호 입력 필드 */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 text-sm">
                  전화번호
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pic-primary"
                  placeholder="01012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="01[0-9]{8,9}"
                  title="전화번호는 하이픈 없이 01012345678 형식으로 입력해주세요."
                  required
                />
              </div>

              {/* 본문 내용 입력 필드 */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">메시지</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pic-primary h-24"
                  placeholder="피드백을 자유롭게 적어주세요."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <p className="text-sm text-pic-primary font-bold mt-2 border-t border-b border-pic-primary py-2 px-1 text-center">
                  함께 성장하는 PICSCORE! 불편한 점이 있다면 피드백 부탁드려요!
                </p>
              </div>

              {/* 버튼 영역 - 로딩 상태 처리 추가 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                  onClick={() => setShowChickenModal(false)}
                  disabled={chickenMutation.isPending}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-pic-primary text-white text-sm rounded-md hover:bg-opacity-90 flex items-center"
                  disabled={chickenMutation.isPending}
                >
                  {chickenMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">&#10227;</span>
                      처리중...
                    </>
                  ) : (
                    "신청하기"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 게임 선택 모달 */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg w-[85%] max-w-md">
            <h2 className="text-xl font-bold mb-3 text-center text-pic-primary">
              게임 선택
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 타임어택 버튼 */}
              <div
                className="bg-white border-2 border-pic-primary rounded-xl p-2 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setShowGameModal(false);
                  navigate("/time-attack");
                }}
              >
                <div className="w-14 h-14 rounded-full bg-pic-primary/100 flex items-center justify-center mb-2">
                  <img src={time} alt="타임어택" className="w-9 h-9" />
                </div>
                <span className="font-bold text-gray-700 text-sm">
                  타임어택
                </span>
                <p className="text-sm text-gray-500 text-center mt-1">
                  빠르게 찍어 올리기기
                </p>
              </div>

              {/* 아레나 버튼 */}
              <div
                className="bg-white border-2 border-pic-primary rounded-xl p-2 flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setShowGameModal(false);
                  navigate("/arena");
                }}
              >
                <div className="w-14 h-14 rounded-full bg-pic-primary/100 flex items-center justify-center mb-2">
                  <img src={ranking} alt="아레나" className="w-9 h-9" />
                </div>
                <span className="font-bold text-gray-700 text-sm">아레나</span>
                <p className="text-sm text-gray-500 text-center mt-1">
                  사진 점수 맞추기
                </p>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-center">
              <button
                className="px-4 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setShowGameModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
