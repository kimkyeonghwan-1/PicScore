import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UserFollowingPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // 로드 시 자동으로 통합 페이지로 리다이렉트
  useEffect(() => {
    if (userId) {
      navigate(`/user/follow/${userId}?tab=followings`, { replace: true });
    } else {
      navigate(-1);
    }
  }, [userId, navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pic-primary"></div>
      <p className="mt-4 text-gray-500">페이지 이동 중...</p>
    </div>
  );
};

export default UserFollowingPage;