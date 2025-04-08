import React from "react";
import { useParams, useLocation } from "react-router-dom";
import FollowTab from "./components/FollowTab";

const Follow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();

  // URL 쿼리 파라미터에서 초기 탭 가져오기
  // 예: /follow?tab=followings
  const queryParams = new URLSearchParams(location.search);
  const initialTab =
    queryParams.get("tab") === "followings" ? "followings" : "followers";

  // URL에서 userId 파싱, 있으면 해당 사용자 정보 조회, 없으면 내 정보 조
  const numericUserId = userId ? parseInt(userId, 10) : undefined;

  return (
    <FollowTab
      userId={numericUserId}
      initialTab={initialTab as "followers" | "followings"}
    />
  );
};

export default Follow;
