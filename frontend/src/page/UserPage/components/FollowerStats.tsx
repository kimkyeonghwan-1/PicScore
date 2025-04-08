import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FollowerStatsProps } from "../types";

const FollowerStats: React.FC<FollowerStatsProps> = ({
  followerCount,
  followingCount,
  userId = null, // 추가: 다른 사용자의 ID (null일 경우 내 프로필)
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 클릭 핸들러 정의 - 내 프로필과 다른 사용자 프로필 구분
  const handleFollowerClick = () => {
    if (userId) {
      // 다른 사용자의 팔로워 페이지로 이동 (통합 페이지)
      navigate(`/user/follow/${userId}?tab=followers`);
    } else {
      // 내 팔로워 페이지로 이동 (통합 페이지)
      navigate("/follow?tab=followers");
    }
  };

  const handleFollowingClick = () => {
    if (userId) {
      // 다른 사용자의 팔로잉 페이지로 이동 (통합 페이지)
      navigate(`/user/follow/${userId}?tab=followings`);
    } else {
      // 내 팔로잉 페이지로 이동 (통합 페이지)
      navigate("/follow?tab=followings");
    }
  };

  return (
    <div className="flex justify-around py-4 border-b">
      <div className="text-center cursor-pointer" onClick={handleFollowerClick}>
        {/* 팔로워 */}
        <div className="font-bold text-xl">{followerCount}</div>
        <div className="text-gray-500 text-sm">팔로워</div>
      </div>
      <div
        className="text-center cursor-pointer"
        onClick={handleFollowingClick}
      >
        {/* 팔로잉 */}
        <div className="font-bold text-xl">{followingCount}</div>
        <div className="text-gray-500 text-sm">팔로잉</div>
      </div>
    </div>
  );
};

export default FollowerStats;