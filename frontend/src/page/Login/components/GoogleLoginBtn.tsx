import { useEffect } from "react";
import googleLoginBtn from "../../../assets/Login/google-login-btn.svg";

const baseURL = import.meta.env.VITE_BASE_URL;

function GoogleLoginBtn() {
  const locateGoogleLogin = () => {
    window.location.href = `${baseURL}/api/v1/user`;
  };
  return (
    <button onClick={locateGoogleLogin}>
      <img
        src={googleLoginBtn}
        alt="Google Login"
        className="w-76 cursor-pointer"
      />
    </button>
  );
}

export default GoogleLoginBtn;
