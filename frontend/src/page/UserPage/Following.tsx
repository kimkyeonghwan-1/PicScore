import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // useParams 가져오기
import { friendApi, FollowingUser } from "../../api/friendApi";
import { useMyFollowings } from "../../hooks/friend";

const Following: React.FC = () => {
  const { userId } = useParams<{ userId: string }>(); // URL에서 userId 가져오기
  const numericUserId = parseInt(userId || "0", 10); // 숫자로 변환

  const [searchQuery, setSearchQuery] = useState("");
  const [followings, setFollowings] = useState<FollowingUser[]>([]);
  const [filteredFollowings, setFilteredFollowings] = useState<FollowingUser[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [followerCount, setFollowerCount] = useState<number>(0); // followerCount 상태 추가
  const [followingCount, setFollowingCount] = useState<number>(0); // 팔로잉 숫자 상태 추가

  const navigate = useNavigate();

  // 팔로잉 목록 불러오기
  const { data, refetch, isFetching } = useMyFollowings();

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        setIsLoading(true);
        if (data?.data) {
          // 각 사용자에게 isFollowing 속성 추가 (초기값은 true, 모두 팔로잉 상태)
          const followingsWithState = data.data.map((user) => ({
            ...user,
            isFollowing: true,
          }));

          setFollowings(followingsWithState);
          setFilteredFollowings(followingsWithState);
          setFollowingCount(followingsWithState.length);
        } else {
          setFollowings([]);
          setFilteredFollowings([]);
        }
      } catch (error) {
        console.error("팔로잉 목록 가져오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowings();
  }, [data]);

  // 팔로워 수 가져오기
  useEffect(() => {
    const fetchFollowerCount = async () => {
      try {
        const response = await friendApi.getMyFollowers();
        if (response.data?.data) {
          setFollowerCount(response.data.data.length);
        }
      } catch (error) {
        console.error("팔로워 데이터 가져오기 실패:", error);
      }
    };

    fetchFollowerCount();
  }, []);

  // 최신 데이터 가져오기
  useEffect(() => {
    refetch();
  }, [refetch]);

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

  // 팔로잉 숫자 업데이트
  useEffect(() => {
    // isFollowing이 true인 사용자만 필터링하여 숫자 계산
    const count = followings.filter((user) => user.isFollowing).length;
    setFollowingCount(count);
  }, [followings]); // followings 상태가 변경될 때마다 실행

  // 사용자 클릭 시 프로필 페이지로 이동
  const handleUserClick = (userId: number) => {
    navigate(`/user/profile/${userId}`);
  };

  // 팔로잉 취소 처리
  const handleUnfollowUser = async (userId: number) => {
    try {
      await friendApi.toggleFollow(userId);

      // 목록에서 제거하지 않고 isFollowing 상태만 업데이트
      setFollowings((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: false } : user
        )
      );

      setFilteredFollowings((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: false } : user
        )
      );
    } catch (error) {
      console.error("팔로잉 취소 실패:", error);
    }
  };

  // 팔로우 처리
  const handleFollowUser = async (userId: number) => {
    try {
      await friendApi.toggleFollow(userId);

      // isFollowing 상태 업데이트
      setFollowings((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: true } : user
        )
      );

      setFilteredFollowings((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      console.error("팔로우 실패:", error);
    }
  };

  // 버튼 클릭 시 동작
  const handleButtonClick = (user: FollowingUser) => {
    setSelectedUserId(user.userId);
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  // 모달에서 "취소하기" 버튼 클릭
  const handleConfirmUnfollow = () => {
    if (selectedUserId) {
      handleUnfollowUser(selectedUserId);
    }
    handleCloseModal();
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 팔로워 페이지로 이동
  const goToFollowers = () => {
    navigate("/follower");
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
        <h1 className="flex-1 text-center font-bold text-lg">팔로잉</h1>
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
      {isLoading || isFetching ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
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
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
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
                    <p className="font-medium">{user.nickName}</p>
                  </div>
                </div>
                {user.isFollowing ? (
                  <button
                    className="px-4 py-1.5 rounded-md text-sm font-medium bg-pic-primary text-white"
                    onClick={() => handleButtonClick(user)}
                  >
                    팔로잉
                  </button>
                ) : (
                  <button
                    className="px-4 py-1.5 rounded-md text-sm font-medium border border-pic-primary bg-white text-black"
                    onClick={() => handleFollowUser(user.userId)}
                  >
                    팔로우
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

      {/* 취소 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <p className="text-center font-bold text-lg mb-4">
              팔로잉을 취소하시겠습니까?
            </p>
            <div className="flex justify-around">
              <button
                className="px-4 py-2 bg-pic-primary text-white rounded-md  hover:brightness-110 transition duration-200"
                onClick={handleConfirmUnfollow}
              >
                팔로잉취소
              </button>
              <button
                className="px-4 py-2 bg-pic-primary text-white rounded-md  hover:brightness-110 transition duration-200"
                onClick={handleCloseModal}
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

export default Following;
