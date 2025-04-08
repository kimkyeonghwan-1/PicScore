import {
  createBrowserRouter,
  useParams,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import App from "../App";
import Home from "../page/Home/Home";
import Test from "../page/Test";
import ErrorPage from "../page/Error/ErrorPage";
import RankingPage from "../page/Ranking/RankingPage";
import { MyPage, UserDetailPage } from "../page/UserPage";
import { ArchievePage } from "../page/Archieve";
import { ChangeInfoPage } from "../page/ChangeInfo";
import Board from "../page/Board/Board";
import Contest from "../page/Contest/Contest";
import Login from "../page/Login/Login";
import TimeAttack from "../page/Timeattack/Timeattack";
import TimeAttackResult from "../page/Timeattack/TimeAttackResult";
import Arena from "../page/Arena/Arena";
import ArenaResult from "../page/Arena/ArenaResult";
import ImageUpload from "../page/ImageEval/ImageUpload";
import ImageEvalResult from "../page/ImageEval/ImageEvalResult";
import PrivateRouter from "./PrivateRouter";
import Welcome from "../page/Welcome/Welcome";
import { useAuthStore } from "../store/authStore";
// 새로운 통합 컴포넌트 추가
import Follow from "../page/UserPage/Follow";
import PhotoPost from "../page/Board/PhotoPost";
import Loading from "../components/Loading";
import SearchResult from "../page/Board/SearchResult";
import TermsAgreement from "../page/Terms/TermsAgreement";

const HomeRouter = () => {
  const [params] = useSearchParams();
  const loginSuccess = params.get("loginSuccess");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn || loginSuccess) {
    return <Home />;
  }
  // 그 외에는 Welcome으로
  return <Welcome />;
};

// userId 매개변수를 전달하기 위한 래퍼 컴포넌트
const UserFollowRedirect = () => {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={`/user/follow/${userId}?tab=followings`} replace />;
};

const UserFollowerRedirect = () => {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={`/user/follow/${userId}?tab=followers`} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomeRouter />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/welcome",
        element: <Welcome />,
      },
      {
        path: "/image-result",
        element: <ImageEvalResult />,
      },
      {
        path: "/image-upload",
        element: <ImageUpload />,
      },
      {
        path: "/photo/:number",
        element: <PhotoPost />,
      },
      {
        path: "/agreement",
        element: <TermsAgreement />,
      },
      {
        element: <PrivateRouter />,
        children: [
          {
            path: "/", // 부모 요소의 path와 일치하면 일로 보냄
            element: <Home />,
          },
          {
            path: "/time-attack",
            element: <TimeAttack />,
          },
          {
            path: "/time-attack/result",
            element: <TimeAttackResult />,
          },
          {
            path: "/arena",
            element: <Arena />,
          },
          {
            path: "/arena/result",
            element: <ArenaResult />,
          },
          {
            path: "/ranking",
            element: <RankingPage />,
          },
          {
            path: "/mypage",
            element: <MyPage />,
          },
          {
            path: "/user/profile/:userId",
            element: <UserDetailPage />,
          },
          {
            path: "/change-info",
            element: <ChangeInfoPage />,
          },
          {
            path: "/archieve",
            element: <ArchievePage />,
          },
          {
            path: "/board",
            element: <Board />,
          },
          {
            path: "/search/:search",
            element: <SearchResult />,
          },
          {
            path: "/contest",
            element: <Contest />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          
          // 새로운 통합 팔로우 페이지
          {
            path: "/follow",
            element: <Follow />,
          },
          {
            path: "/user/follow/:userId",
            element: <Follow />,
          },
          
          // 기존 URL과의 호환성을 위한 리다이렉트
          {
            path: "/following",
            element: <Navigate to="/follow?tab=followings" replace />,
          },
          {
            path: "/follower",
            element: <Navigate to="/follow?tab=followers" replace />,
          },
          {
            path: "/user/following/:userId", 
            element: <UserFollowRedirect />,
          },
          {
            path: "/user/follower/:userId",
            element: <UserFollowerRedirect />,
          },
          {
            path: "photo",
            element: <>게시글을 찾을 수 없습니다.</>,
          },
          {
            path: "/loading",
            element: <Loading />,
          },
        ],
      },
    ],
  },
]);

export default router;