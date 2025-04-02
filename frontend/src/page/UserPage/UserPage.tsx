import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

// 컴포넌트
import ProfileHeader from "./components/ProfileHeader";
import FollowerStats from "./components/FollowerStats";
import StatsGrid from "./components/StatsGrid";
import TabNavigation from "./components/TabNavigation";
import PhotoGrid from "./components/PhotoGrid";
import NoAuthMessage from "./components/NoAuthMessage";

// API
import { userApi } from "../../api/userApi";

import {
  UserPageProps,
  UserProfileData,
  UserStatsData,
  PhotoItem,
} from "./types";

// Main UserPage Component
const UserPage: React.FC<UserPageProps> = ({ userId, apiEndpoint }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMyProfile = userId === null;

  const [profile, setProfile] = useState<UserProfileData>({
    nickname: "",
    statusMessage: "",
    profileImage: null,
    followerCount: 0,
    followingCount: 0,
    isMyProfile: isMyProfile,
    isFollowing: false,
    displayBadgeId: undefined,
  });

  const [userStats, setUserStats] = useState<UserStatsData>({
    averageScore: 0,
    contestRank: "0",
    timeAttackRank: "0",
    arenaRank: "0",
  });

  const [activeTab, setActiveTab] = useState<string>("gallery");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 업적 페이지에서 선택한 뱃지 처리
  useEffect(() => {
    if (
      location.state &&
      location.state.updatedProfile &&
      location.state.updatedProfile.displayBadgeId
    ) {
      setProfile((prev) => ({
        ...prev,
        displayBadgeId: location.state.updatedProfile.displayBadgeId,
      }));

      localStorage.setItem(
        "selectedBadgeId",
        location.state.updatedProfile.displayBadgeId
      );

      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchUserData();
  }, [userId, activeTab, apiEndpoint, isMyProfile]); // isMyProfile도 의존성 배열에 추가

  const fetchUserData = async () => {
    setLoading(true);

    try {
      if (isMyProfile) {
        // 내 프로필 데이터 조회
        const profileResponse = await userApi.getMyProfile();
        const statsResponse = await userApi.getMyStatistics();
        // 내 프로필일 경우 activeTab에 따라 다른 API 호출
        const photosResponse = await userApi.getMyPhotos(
          activeTab !== "hidden" // 'gallery' 또는 'contest' 일때 true, 'hidden' 일때 false
        );

        console.log("profileResponse", profileResponse);
        console.log("statsResponse", statsResponse);
        console.log("photosResponse", photosResponse);

        // 프로필 정보 처리
        const profileData = profileResponse.data.data;
        setProfile({
          nickname: profileData.nickName,
          statusMessage: profileData.message,
          profileImage: profileData.profileImage,
          followerCount: profileData.followerCnt,
          followingCount: profileData.followingCnt,
          isMyProfile: true,
          isFollowing: false, // 내 프로필은 항상 false
          displayBadgeId: localStorage.getItem("selectedBadgeId") || undefined,
        });

        // 통계 정보 처리
        const statsData = statsResponse.data.data;
        setUserStats({
          averageScore: statsData.scoreAvg,
          contestRank: "N/A", // 실제 데이터로 교체 필요
          timeAttackRank: statsData.timeAttackRank.toString(),
          arenaRank: "N/A", // 실제 데이터로 교체 필요
        });

        // 사진 정보 처리
        const photoItems: PhotoItem[] = photosResponse.data.data.map(
          (photo: any) => ({
            id: photo.id.toString(),
            imageUrl: photo.imageUrl,
            score: photo.score,
            isPrivate: activeTab === "hidden", // 비공개 탭일 때만 true
          })
        );

        console.log("photoItems", photoItems);
        setPhotos(photoItems);
      } else if (userId) {
        // 다른 사용자 프로필 데이터 조회
        const profileResponse = await userApi.getUserProfile(parseInt(userId));
        const statsResponse = await userApi.getUserStatistics(parseInt(userId));
        // 다른 사용자 프로필일 경우 항상 공개 사진만 조회 (isPublic = true)
        const photosResponse = await userApi.getUserPhotos(
          parseInt(userId),
          true // 공개된 사진만 가져옴
        );

        // 프로필 정보 처리
        const profileData = profileResponse.data.data;
        setProfile({
          nickname: profileData.nickName,
          statusMessage: profileData.message,
          profileImage: profileData.profileImage,
          followerCount: profileData.followerCnt,
          followingCount: profileData.followingCnt,
          isMyProfile: false,
          isFollowing: profileData.isFollowing, // API 응답 값 사용
          displayBadgeId: undefined, // 다른 유저 프로필에서는 뱃지 표시 안 함 (필요 시 API 수정)
        });

        // 통계 정보 처리
        const statsData = statsResponse.data.data;
        setUserStats({
          averageScore: statsData.scoreAvg,
          contestRank: "N/A", // 실제 데이터로 교체 필요
          timeAttackRank: statsData.timeAttackRank.toString(),
          arenaRank: "N/A", // 실제 데이터로 교체 필요
        });

        // 사진 정보 처리 - 다른 사용자의 경우 항상 공개 사진
        const photoItems: PhotoItem[] = photosResponse.data.data.map(
          (photo: any) => ({
            id: photo.id.toString(),
            imageUrl: photo.imageUrl,
            score: photo.score,
            isPrivate: false, // 다른 사용자의 사진은 항상 공개 상태
          })
        );

        console.log("other user photoItems", photoItems);
        setPhotos(photoItems);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // TODO: Add user-friendly error handling (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  // --- 수정된 handleFollowClick 함수 ---
  const handleFollowClick = async () => {
    // userId가 있을 때만 (즉, 다른 사용자의 프로필을 보고 있을 때만) 실행
    if (userId) {
      try {
        // API 호출 (성공/실패 여부와 관계없이 UI 우선 변경 - Optimistic Update)
        await userApi.toggleFollow(parseInt(userId));

        // setProfile 상태 업데이트
        setProfile((prev) => {
          // 현재 팔로우 상태의 반대 상태 (클릭 후 예상되는 상태)
          const nowFollowing = !prev.isFollowing;
          // 팔로워 수 계산: nowFollowing이 true면 (즉, 팔로우 시작) +1, false면 (언팔로우) -1
          const newFollowerCount = nowFollowing
            ? prev.followerCount + 1
            : prev.followerCount - 1;

          return {
            ...prev,
            isFollowing: nowFollowing, // 팔로우 상태 업데이트
            // followerCount 업데이트 (음수가 되지 않도록 Math.max 사용 - 선택적 안전장치)
            followerCount: Math.max(0, newFollowerCount),
          };
        });
      } catch (error) {
        console.error("팔로우 요청 실패:", error);
        // --- 중요: API 요청 실패 시 UI 롤백 ---
        // 만약 API 호출이 실패하면, UI 변경을 원래대로 되돌리는 로직 추가
        // 예를 들어, 원래 상태를 잠시 저장해두거나, fetchUserData를 다시 호출하여 서버 상태와 동기화
        // 여기서는 간단히 에러만 출력하고 UI는 그대로 둠 (개선 필요 시 롤백 로직 구현)
        // 예시: fetchUserData(); // 서버 데이터로 다시 동기화 (네트워크 비용 발생)
      }
    }
  };
  // --- 수정 끝 ---

  const handleEditClick = () => {
    navigate("/change-info");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const getTabs = () => {
    if (isMyProfile) {
      return [
        { id: "gallery", label: "게시글" },
        { id: "hidden", label: "비공개" },
        { id: "contest", label: "컨테스트" },
      ];
    } else {
      return [
        { id: "gallery", label: "게시글" },
        { id: "contest", label: "컨테스트" },
      ];
    }
  };

  return (
    <div className="w-full flex flex-col max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      <ProfileHeader
        profile={profile}
        onFollowClick={handleFollowClick} // 수정된 함수 전달
        onEditClick={handleEditClick}
      />

      <FollowerStats
        followerCount={profile.followerCount} // 업데이트된 followerCount가 전달됨
        followingCount={profile.followingCount}
        userId={userId}
      />

      {/* 조건부 렌더링: 내 프로필이거나 팔로우 중일 때만 통계 표시 */}
      {profile.isMyProfile || profile.isFollowing ? (
        <StatsGrid stats={userStats} />
      ) : (
        <NoAuthMessage /> // 팔로우 안 한 다른 유저 프로필 통계 가리기
      )}

      <div className="mt-4">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={getTabs()}
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
          </div>
        ) : activeTab === "contest" ? (
          // 컨테스트 탭일 경우 "준비중입니다" 메시지 표시
          <div className="p-8 text-center my-4">
            <div className="mb-4">
              {/* SVG 아이콘 */}
              <svg /* ... SVG 속성들 ... */ className="mx-auto text-gray-400">
                {/* ... path 등 ... */}

                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              컨테스트 게시판 준비 중
            </h3>
            <p className="text-gray-500">
              현재 컨테스트 기능을 준비 중입니다.
              <br />곧 서비스를 이용하실 수 있습니다.
            </p>
          </div>
        ) : (
          <PhotoGrid
            photos={photos}
            activeTab={activeTab}
            isMyProfile={isMyProfile}
          />
        )}
      </div>
    </div>
  );
};

export default UserPage;
