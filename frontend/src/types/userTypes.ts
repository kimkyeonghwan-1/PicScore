// 사용자 인증 상태 관련 타입
export interface User {
  isLoggedIn: boolean;
  userId: string | null;
  nickname: string | null;
  profileImage: string | null;
  token: string | null;
}

// 사용자 프로필 데이터 인터페이스
export interface UserProfileData {
  nickname: string;
  statusMessage: string;
  profileImage: string | null;
  followerCount: number;
  followingCount: number;
  isMyProfile: boolean;
  isFollowing: boolean;
  displayBadgeId?: string; // 표시할 뱃지 ID
}

// 사용자 통계 데이터 인터페이스
export interface UserStatsData {
  averageScore: number;
  contestRank: string;
  timeAttackRank: string;
  arenaRank: string;
}

// 사진 아이템 인터페이스
export interface PhotoItem {
  id: string;
  imageUrl: string;
  score: number;
  isPrivate: boolean;
}

// 마이페이지 & 유저 페이지 속성 인터페이스
export interface UserPageProps {
  userId: string | null; // null for mypage, string for other user's page
  apiEndpoint: string;
}

// 팔로워 통계 속성 인터페이스
export interface FollowerStatsProps {
  followerCount: number;
  followingCount: number;
}

// 프로필 헤더 속성 인터페이스
export interface ProfileHeaderProps {
  profile: UserProfileData;
  onFollowClick: () => void;
  onEditClick: () => void;
}

// 탭 인터페이스
export interface Tab {
  id: string;
  label: string;
}

// 탭 네비게이션 속성 인터페이스
export interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Tab[];
}

// 통계 그리드 속성 인터페이스
export interface StatsGridProps {
  stats: UserStatsData;
}

// 통계 카드 속성 인터페이스
export interface StatsCardProps {
  title: string;
  value: string | number;
  color: string;
}

// 사진 그리드 속성 인터페이스
export interface PhotoGridProps {
  photos: PhotoItem[];
  activeTab: string;
  isMyProfile: boolean;
}

// 헤더 속성 인터페이스
export interface HeaderProps {
  title: string;
}

// 프로필 편집 페이지 사용자 데이터 인터페이스
export interface UserProfileFormData {
  nickname: string;
  statusMessage: string;
  profileImage: string | null;
  displayBadgeId?: string; // 표시할 뱃지 ID
}

// 사용자 프로필 타입 (ChangeInfo 페이지용)
export interface UserProfile {
  userId: string;
  nickname: string;
  bio: string;
  profileImage: string | null;
  email: string;
  isPrivate: boolean;
  allowPhotoDownload: boolean;
  notificationSettings: NotificationSettings;
}

// 알림 설정 타입
export interface NotificationSettings {
  newFollower: boolean;
  newComment: boolean;
  photoRated: boolean;
  contestResult: boolean;
}

// 폼 에러 타입
export interface FormErrors {
  nickname?: string;
  bio?: string;
  profileImage?: string;
}
