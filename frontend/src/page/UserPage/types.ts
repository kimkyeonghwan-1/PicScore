// UserPage에서 사용되는 타입 정의

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
  timeAttackRank: string;
  arenaRank: string;
  postsCount?: number; // 게시물 수 필드
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
  userId?: string | null; // 추가: 다른 사용자의 ID (null일 경우 내 프로필)
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
