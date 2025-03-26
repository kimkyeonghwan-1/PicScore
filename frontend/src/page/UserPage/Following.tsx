import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyFollowings } from "../../hooks/friend"; // 경로는 실제 위치에 맞게 조정하세요
import { friendApi } from "../../api/friendApi"; // 경로는 실제 위치에 맞게 조정하세요

// 백엔드 응답 타입에 맞게 인터페이스 수정
interface FollowUser {
  userId: number;
  nickName: string;
  profileImage: string;
  isFollowing?: boolean; // 팔로잉 목록에는 이 필드가 없을 수 있음
}

interface FollowingProps {
  followerCount?: number;
  followingCount?: number;
}

const Following: React.FC<FollowingProps> = ({
  followerCount,
  followingCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const navigate = useNavigate();

  // useQuery 훅을 사용하여 팔로잉 데이터 가져오기
  const {
    data: followings = [],
    isLoading: isFollowingsLoading,
    isError,
    refetch: refetchFollowings,
  } = useMyFollowings();

  // 검색어로 필터링
  const filteredData = followings.filter((user) =>
    user.nickName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(-1);
  };

  // 팔로워 페이지로 이동
  const goToFollower = () => {
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
          onClick={goToFollower}
        >
          {followerCount} 팔로워
        </button>
        <button className="flex-1 py-3 text-center font-medium border-b-2 border-black">
          {followingCount} 팔로우
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

      {/* 사용자 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isFollowingsLoading ? (
          // 로딩 중 표시
          <div className="p-4 text-center text-gray-500">로딩 중...</div>
        ) : isError ? (
          <div className="p-4 text-center text-gray-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map((user) => (
            <div
              key={user.userId}
              className="flex items-center p-4 border-b bg-white"
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
              <div className="flex-1">
                <p className="font-medium">{user.nickName}</p>
              </div>
              <button
                className="px-4 py-1.5 rounded-md text-sm font-medium bg-pic-primary text-white shadow-2xl"
                onClick={() => console.log(`팔로잉 취소: ${user.userId}`)} // 버튼 클릭 시 동작
              >
                팔로잉
              </button>
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
    </div>
  );
};

export default Following;
