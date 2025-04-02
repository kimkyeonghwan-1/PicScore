import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { friendApi, FollowingUser } from "../../api/friendApi";
import { useAuthStore } from "../../store/authStore";

const UserFollowingPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = parseInt(userId || "0", 10); // 숫자로 변환

  const [searchQuery, setSearchQuery] = useState("");
  const [followings, setFollowings] = useState<FollowingUser[]>([]);
  const [filteredFollowings, setFilteredFollowings] = useState<FollowingUser[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const myId = useAuthStore((state) => state.userId);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchFollowings = async () => {
      if (!userId || !isLoggedIn) {
        setIsLoading(false);
        setError("사용자 정보가 없거나 로그인이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 사용자의 팔로잉 목록 가져오기
        const response = await friendApi.getUserFollowings(parseInt(userId));

        if (response.data?.data) {
          setFollowings(response.data.data);
          setFilteredFollowings(response.data.data);
          setFollowingCount(response.data.data.length);

          // 사용자 정보 가져오기 (닉네임 표시용)
          try {
            const userProfileResponse = await friendApi.getUserProfile(
              parseInt(userId)
            );
            if (userProfileResponse.data?.data) {
              setUserName(userProfileResponse.data.data.nickName);
              setFollowerCount(userProfileResponse.data.data.followerCnt);
            }
          } catch (profileError) {
            console.error("사용자 프로필 가져오기 실패:", profileError);
          }
        } else {
          setFollowings([]);
          setFilteredFollowings([]);
        }
      } catch (error) {
        console.error("팔로잉 목록 가져오기 실패:", error);
        setError("팔로잉 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowings();
  }, [userId, isLoggedIn]);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchQuery) {
      const filtered = followings.filter((user) =>
        user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowings(filtered);
    } else {
      setFilteredFollowings(followings);
    }
  }, [searchQuery, followings]);

  // 사용자 프로필 클릭 핸들러
  const handleUserClick = (userId: number) => {
    navigate(`/user/profile/${userId}`);
  };

  // 팔로잉 토글 핸들러
  const handleToggleFollow = async (followingId: number) => {
    try {
      // 서버에 팔로우 토글 요청 보내기
      await friendApi.toggleFollow(followingId);

      // UI 상태 업데이트
      setFollowings((prev) =>
        prev.map((user) =>
          user.userId === followingId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      setFilteredFollowings((prev) =>
        prev.map((user) =>
          user.userId === followingId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      // 선택된 사용자 정보 지우기
      setSelectedUserId(null);
      setShowConfirmModal(false);
    } catch (error) {
      console.error("팔로잉 토글 실패:", error);
    }
  };

  // 언팔로우 확인 모달 열기
  const handleConfirmUnfollow = (userId: number) => {
    const user = followings.find((u) => u.userId === userId);
    if (user && user.isFollowing) {
      setSelectedUserId(userId);
      setShowConfirmModal(true);
    } else {
      // 이미 팔로우 중이 아니라면 바로 팔로우
      handleToggleFollow(userId);
    }
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1);
  };

  // 사용자의 팔로워 페이지로 이동
  const goToFollowers = () => {
    navigate(`/user/follower/${userId}`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center p-4 bg-white border-b">
        <button onClick={handleGoBack} className="p-1">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">
          {userName ? `${userName}님의 팔로잉` : "팔로잉"}
        </h1>
        <div className="w-6"></div> {/* 균형을 위한 더미 요소 */}
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        <button
          className="flex-1 py-3 text-center text-gray-500"
          onClick={goToFollowers}
        >
          {followerCount} 팔로워
        </button>
        <button className="flex-1 py-3 text-center font-medium border-b-2 border-black">
          {followingCount} 팔로잉
        </button>
      </div>

      {/* 검색창 */}
      <div className="p-4 border-b">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <svg
            className="w-5 h-5 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <input
            type="text"
            placeholder="검색"
            className="bg-transparent w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : (
        /* 사용자 목록 */
        <div className="flex-1 overflow-y-auto">
          {filteredFollowings.length > 0 ? (
            filteredFollowings.map((user) => (
              <div
                key={user.userId}
                className="flex items-center p-4 border-b bg-white"
              >
                <div
                  className="flex-1 flex items-center cursor-pointer"
                  onClick={() => handleUserClick(user.userId)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mr-3">
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
                  <div>
                    <p className="font-medium">{user.nickName}</p>
                  </div>
                </div>
                {userId && parseInt(userId) === myId ? (
                  <></>
                ) : (
                  <button
                    className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                      user.isFollowing
                        ? "bg-pic-primary text-white"
                        : "border border-pic-primary text-pic-primary"
                    }`}
                    onClick={() => handleConfirmUnfollow(user.userId)}
                  >
                    {user.isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "팔로잉한 사용자가 없습니다."}
            </div>
          )}
        </div>
      )}

      {/* 언팔로우 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <p className="text-center font-bold text-lg mb-4">
              팔로잉을 취소하시겠습니까?
            </p>
            <div className="flex justify-around">
              <button
                className="px-4 py-2 bg-pic-primary text-white rounded-md"
                onClick={() => {
                  if (selectedUserId) handleToggleFollow(selectedUserId);
                }}
              >
                팔로잉취소
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                onClick={() => setShowConfirmModal(false)}
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFollowingPage;
