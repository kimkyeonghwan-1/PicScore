import { Link, useNavigate } from "react-router-dom";
import GoogleLoginBtn from "./components/GoogleLoginBtn";
import KakaoLoginBtn from "./components/KakaoLoginBtn";
import { CameraIcon } from "@heroicons/react/24/solid";
function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen justify-center items-center gap-20">
      <div className="flex flex-col items-center">
        <div className="font-logo text-5xl my-5">
          <span className="text-pic-primary ">PIC</span>
          <span>SCORE</span>
        </div>

        <div
          onClick={() => navigate("/image-upload")}
          className="w-50 h-50 flex flex-col inset-shadow-sm shadow-sm justify-center items-center mt-15 mb-5 border-gray-300 rounded-lg"
        >
          <CameraIcon className="w-30 text-pic-primary" />
          <div className="font-bold text-gray-900">로그인 없이 시작하기</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <GoogleLoginBtn />
        {/* <KakaoLoginBtn /> */}
      </div>
    </div>
  );
}

export default Login;
