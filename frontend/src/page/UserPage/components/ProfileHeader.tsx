// page/UserPage/components/ProfileHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useLogout } from "../../../hooks/useUser";
import { testApi } from "../../../api/api";

interface ProfileHeaderProps {
  profile: {
    nickname: string;
    statusMessage: string;
    profileImage: string | null;
    isMyProfile: boolean;
    isFollowing: boolean;
    displayBadgeId?: string;
  };
  onFollowClick: () => void;
  onEditClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onFollowClick,
  onEditClick,
}) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // 로그아웃 처리
  const logoutMutation = useLogout();
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
      },
    });
  };

  // 업적 페이지로 이동
  const handleAchievementClick = async () => {
    try {
      // 먼저 badge/complete API를 호출하여 업적 상태 확인 및 갱신
      const response = await testApi.post("/api/v1/badge/complete", {}, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      console.log("업적 상태 확인 결과:", response.data);
      
      // 업적 페이지로 이동 (응답 데이터를 state로 전달)
      navigate("/archieve", {
        state: {
          badgeCheckResult: response.data.data
        }
      });
    } catch (error) {
      console.error("업적 상태 확인 중 오류:", error);
      // 오류가 발생해도 업적 페이지로 이동
      navigate("/archieve");
    }
  };

  return (
    <div className="bg-pic-primary p-4 text-white">
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={`${profile.nickname}의 프로필`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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

        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">{profile.nickname}</h2>

            {profile.isMyProfile && (
              <button
                onClick={handleLogout}
                className="ml-2 px-2 py-1 bg-white/20 rounded-md text-xs text-white hover:bg-white/30 transition"
              >
                로그아웃
              </button>
            )}
          </div>
          <p className="text-sm text-white/80">{profile.statusMessage}</p>
        </div>

        {/* 업적 버튼 */}
        {profile.isMyProfile && (
          <button
            onClick={handleAchievementClick}
            className="bg-white text-pic-primary px-2 py-1 rounded-md text-xs font-medium hover:bg-white/90 transition flex items-center"
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
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            업적
          </button>
        )}
      </div>

      {profile.isMyProfile ? (
        <button
          onClick={onEditClick}
          className="mt-4 border border-white rounded-full px-4 py-1 text-sm text-white font-medium"
        >
          편집
        </button>
      ) : (
        <button
          onClick={onFollowClick}
          className={`mt-4 rounded-full px-4 py-1 text-sm font-medium ${
            profile.isFollowing
              ? "bg-white text-pic-primary"
              : "border border-white text-white"
          }`}
        >
          {profile.isFollowing ? "팔로잉" : "팔로우"}
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;
