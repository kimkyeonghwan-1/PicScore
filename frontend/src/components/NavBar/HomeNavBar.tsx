import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import InstallPWA from "../InstallPWA";

const HomeNavBar = () => {
  return (
    <nav className="max-w-md w-full fixed top-0 left-0 right-0 z-40 bg-white shadow-sm py-3 px-6 mx-auto">
      <div className="flex justify-center items-center ">
        {/* 로고 */}
        <Link to="/" className="text-3xl font-logo flex">
          <span className="text-pic-primary">PIC</span>
          <span className="text-black">SCORE</span>
        </Link>

        {/* 알림 벨 아이콘 */}
        <InstallPWA />
      </div>
    </nav>
  );
};

export default HomeNavBar;
