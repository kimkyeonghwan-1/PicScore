import {
  createBrowserRouter,
  useParams,
  useSearchParams,
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
import ImageUpload from "../page/ImageEval/ImageUpload";
import ImageEvalResult from "../page/ImageEval/ImageEvalResult";
import PrivateRouter from "./PrivateRouter";
import Welcome from "../page/Welcome/Welcome";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Following from "../page/UserPage/Following";
import Follower from "../page/UserPage/Follower";
import UserFollowing from "../page/UserPage/UserFollowing";
import UserFollower from "../page/UserPage/UserFollower";
import PhotoPost from "../page/Board/PhotoPost";
import Loading from "../components/Loading";
import SearchResult from "../page/Board/SearchResult";

const HomeRouter = () => {
  const [params] = useSearchParams();
  const accessToken = params.get("access");
  const loginSuccess = params.get("loginSuccess");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const login = useAuthStore((state) => state.login);

  // useEffect를 사용하여 렌더링 후에 상태 업데이트
  useEffect(() => {
    if (loginSuccess && accessToken) {
      login(accessToken);
      console.log(localStorage.getItem("auth")); // localStorage에서 확인 (accessToken이 아님)
    }
  }, [loginSuccess, accessToken, login]);

  if (isLoggedIn || (loginSuccess && accessToken)) {
    return <Home />;
  }
  // 그 외에는 Welcome으로
  return <Welcome />;
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
            path: "/ranking",
            element: <RankingPage />,
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
            path: "/photo/:number",
            element: <PhotoPost />,
          },

          {
            path: "/contest",
            element: <Contest />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          // 내 팔로잉/팔로워 페이지
          {
            path: "/following",
            element: <Following />,
          },
          {
            path: "/follower",
            element: <Follower />,
          },
          // 다른 사용자의 팔로잉/팔로워 페이지
          {
            path: "/user/following/:userId",
            element: <UserFollowing />,
          },
          {
            path: "/user/follower/:userId",
            element: <UserFollower />,
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
