// page/Ranking/components/RankingList.tsx
import React from "react";
import { RankingUser } from "../../../api/rankingApi";

interface RankingListProps {
  rankings: RankingUser[];
  loading: boolean;
}

// Ranking Table Header Component
const RankingTableHeader: React.FC = () => (
  <div className="bg-gray-100 p-3 grid grid-cols-3 text-center font-medium">
    <div>순위</div>
    <div>닉네임</div>
    <div>점수</div>
  </div>
);

// Ranking Item Component
interface RankingItemProps {
  user: RankingUser;
}

const RankingItem: React.FC<RankingItemProps> = ({ user }) => {
  // 점수 확인용 로깅
  console.log(`랭킹 유저 점수 - ${user.nickName}: ${user.score} (타입: ${typeof user.score})`);
  
  return (
    <li className="border-b border-gray-100 py-4 grid grid-cols-3 items-center">
      <div className="text-center text-xl font-bold">{user.rank}</div>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.nickName} 프로필`}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-profile.jpg"; // 로드 실패 시 기본 이미지
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
        <span>{user.nickName}</span>
      </div>
      <div className="text-center font-bold text-xl">
        {typeof user.score === 'number' ? user.score.toFixed(1) : user.score}
      </div>
    </li>
  );
};

const RankingList: React.FC<RankingListProps> = ({ rankings, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">랭킹 정보가 없습니다</div>
    );
  }

  return (
    <div>
      <RankingTableHeader />
      <ul>
        {rankings.map((user) => (
          <RankingItem key={user.userId} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default RankingList;