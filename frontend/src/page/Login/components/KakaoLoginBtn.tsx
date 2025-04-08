import kakaoLoginBtn from "../../../assets/Login/kakao-login-btn.svg";

const baseURL = import.meta.env.VITE_BASE_URL;

function KakaoLoginBtn() {
  const locateKakaoLogin = () => {
    window.location.href = `${baseURL}/api/v1/user/kakao`;
  };
  return (
    <button onClick={locateKakaoLogin}>
      <img
        src={kakaoLoginBtn}
        alt="Google Login"
        className="w-76 cursor-pointer"
      />
    </button>
  );
}

export default KakaoLoginBtn;
