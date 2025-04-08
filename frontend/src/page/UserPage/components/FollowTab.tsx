import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { friendApi, FollowingUser, FollowerUser } from "../../../api/friendApi";
import {
  useMyFollowings,
  useMyFollowers,
  useUserFollowings,
  useUserFollowers,
} from "../../../hooks/friend";

type TabType = "followers" | "followings";

interface FollowTabProps {
  userId?: number; // 조회할 사용자 ID (없으면 내 정보)
  initialTab?: TabType; // 초기 선택 탭
}

const FollowTab: React.FC<FollowTabProps> = ({
  userId,
  initialTab = "followers",
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [followings, setFollowings] = useState<FollowingUser[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<FollowerUser[]>(
    []
  );
  const [filteredFollowings, setFilteredFollowings] = useState<FollowingUser[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [modalAction, setModalAction] = useState<"unfollow" | "delete">(
    "unfollow"
  );

  const navigate = useNavigate();
  const { urlUserId } = useParams<{ urlUserId: string }>();

  // URL에서 userId를 가져오거나 prop으로 전달된 userId 사용
  const targetUserId =
    userId || (urlUserId ? parseInt(urlUserId, 10) : undefined);

  // 내 정보 조회인지 확인 (없으면 내 정보로 간주)
  const isMyProfile = !targetUserId;

  // 데이터 쿼리
  const {
    data: myFollowersData,
    refetch: refetchMyFollowers,
    isFetching: isMyFollowersFetching,
  } = useMyFollowers();

  const {
    data: myFollowingsData,
    refetch: refetchMyFollowings,
    isFetching: isMyFollowingsFetching,
  } = useMyFollowings();

  const {
    data: userFollowersData,
    refetch: refetchUserFollowers,
    isFetching: isUserFollowersFetching,
  } = useUserFollowers(targetUserId || 0);

  const {
    data: userFollowingsData,
    refetch: refetchUserFollowings,
    isFetching: isUserFollowingsFetching,
  } = useUserFollowings(targetUserId || 0);

  // 팔로워 수와 팔로잉 수를 실시간으로 계산
  // isFollowing이 true인 사용자만 팔로잉 수에 포함
  const followingCount = useMemo(() => {
    return followings.filter((user) => user.isFollowing).length;
  }, [followings]);

  // 팔로워/팔로잉 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (isMyProfile) {
          // 내 프로필 정보 로드
          if (myFollowersData?.data) {
            setFollowers(myFollowersData.data);
            setFilteredFollowers(myFollowersData.data);
          }

          if (myFollowingsData?.data) {
            const followingsWithState = myFollowingsData.data.map((user) => ({
              ...user,
              isFollowing: true,
            }));
            setFollowings(followingsWithState);
            setFilteredFollowings(followingsWithState);
          }
        } else if (targetUserId) {
          // 특정 사용자의 프로필 정보 로드
          if (userFollowersData?.data) {
            setFollowers(userFollowersData.data);
            setFilteredFollowers(userFollowersData.data);
          }

          if (userFollowingsData?.data) {
            setFollowings(userFollowingsData.data);
            setFilteredFollowings(userFollowingsData.data);
          }
        }
      } catch (error) {
        console.error("팔로워/팔로잉 데이터 가져오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    isMyProfile,
    targetUserId,
    myFollowersData,
    myFollowingsData,
    userFollowersData,
    userFollowingsData,
  ]);

  // 최신 데이터 가져오기
  useEffect(() => {
    if (isMyProfile) {
      refetchMyFollowers();
      refetchMyFollowings();
    } else if (targetUserId) {
      refetchUserFollowers();
      refetchUserFollowings();
    }
  }, [
    isMyProfile,
    targetUserId,
    refetchMyFollowers,
    refetchMyFollowings,
    refetchUserFollowers,
    refetchUserFollowings,
  ]);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchQuery) {
      if (currentTab === "followers") {
        const filtered = followers.filter((user) =>
          user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFollowers(filtered);
      } else {
        const filtered = followings.filter((user) =>
          user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFollowings(filtered);
      }
    } else {
      setFilteredFollowers(followers);
      setFilteredFollowings(followings);
    }
  }, [searchQuery, followers, followings, currentTab]);

  // 팔로잉 취소 처리
  const handleUnfollowUser = async (userId: number) => {
    try {
      await friendApi.toggleFollow(userId);

      // 목록에서 isFollowing 상태만 업데이트
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

      // 팔로워 목록에도 반영 (해당 사용자가 팔로워 목록에 있는 경우)
      setFollowers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: false } : user
        )
      );

      setFilteredFollowers((prev) =>
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

      // 팔로워 목록에도 반영
      setFollowers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: true } : user
        )
      );

      setFilteredFollowers((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      console.error("팔로우 실패:", error);
    }
  };

  // 팔로워 삭제 처리
  const handleDeleteFollower = async (userId: number) => {
    try {
      await friendApi.deleteFollower(userId);
      // 삭제 성공 후 팔로워 목록에서 제거
      setFollowers((prev) => prev.filter((user) => user.userId !== userId));
      setFilteredFollowers((prev) =>
        prev.filter((user) => user.userId !== userId)
      );
    } catch (error) {
      console.error("팔로워 삭제 실패:", error);
    }
  };

  // 사용자 클릭 시 프로필 페이지로 이동
  const handleUserClick = (userId: number) => {
    navigate(`/user/profile/${userId}`);
  };

  // 버튼 클릭 시 동작
  const handleActionButtonClick = (
    userId: number,
    action: "unfollow" | "delete"
  ) => {
    setSelectedUserId(userId);
    setModalAction(action);
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  // 모달에서 액션 확인
  const handleConfirmAction = () => {
    if (selectedUserId) {
      if (modalAction === "unfollow") {
        handleUnfollowUser(selectedUserId);
      } else if (modalAction === "delete") {
        handleDeleteFollower(selectedUserId);
      }
    }
    handleCloseModal();
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 로딩 상태 확인
  const isDataLoading =
    isLoading ||
    (isMyProfile
      ? isMyFollowersFetching || isMyFollowingsFetching
      : isUserFollowersFetching || isUserFollowingsFetching);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* 헤더 */}

      {/* 탭 */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center ${
            currentTab === "followers"
              ? "font-medium border-b-2 border-black"
              : "text-gray-500"
          }`}
          onClick={() => setCurrentTab("followers")}
        >
          {followers.length} 팔로워
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            currentTab === "followings"
              ? "font-medium border-b-2 border-black"
              : "text-gray-500"
          }`}
          onClick={() => setCurrentTab("followings")}
        >
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
      {isDataLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
        </div>
      ) : (
        /* 사용자 목록 */
        <div className="flex-1 overflow-y-auto">
          {currentTab === "followers" ? (
            // 팔로워 목록
            filteredFollowers.length > 0 ? (
              filteredFollowers.map((user) => (
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
                  {isMyProfile && (
                    <div className="flex gap-2">
                      {!user.isFollowing && (
                        <button
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-pic-primary text-pic-primary"
                          onClick={() => handleFollowUser(user.userId)}
                        >
                          맞팔로우
                        </button>
                      )}
                      <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-pic-primary text-white"
                        onClick={() =>
                          handleActionButtonClick(user.userId, "delete")
                        }
                      >
                        삭제
                      </button>
                    </div>
                  )}
                  {!isMyProfile && user.isFollowing && (
                    <button
                      className="px-4 py-1.5 rounded-md text-sm font-medium bg-pic-primary text-white"
                      onClick={() =>
                        handleActionButtonClick(user.userId, "unfollow")
                      }
                    >
                      팔로잉
                    </button>
                  )}
                  {!isMyProfile && !user.isFollowing && (
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
                {searchQuery ? "검색 결과가 없습니다." : "팔로워가 없습니다."}
              </div>
            )
          ) : // 팔로잉 목록
          filteredFollowings.length > 0 ? (
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
                    onClick={() =>
                      handleActionButtonClick(user.userId, "unfollow")
                    }
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

      {/* 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <p className="text-center font-bold text-lg mb-4">
              {modalAction === "unfollow"
                ? "팔로잉을 취소하시겠습니까?"
                : "팔로워를 삭제하시겠습니까?"}
            </p>
            <div className="flex justify-around">
              <button
                className="px-4 py-2 bg-pic-primary text-white rounded-md  hover:brightness-110 transition duration-200"
                onClick={handleConfirmAction}
              >
                {modalAction === "unfollow" ? "팔로잉취소" : "삭제"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md  hover:brightness-110 transition duration-200"
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

export default FollowTab;
